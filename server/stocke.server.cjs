// stocke.server.cjs  ← CommonJS 버전
require("dotenv").config();
const http = require("http");
const axios = require("axios");
const WebSocket = require("ws");
const { WebSocketServer } = require("ws");
const path = require("path");

const must = ["APP_KEY","APP_SECRET","KIS_TR_ID_INDEX"];
const miss = must.filter(k => !process.env[k] || !String(process.env[k]).trim());
if (miss.length) {
  console.error("❌ .env 누락:", miss);
  console.error("👉 .env 파일에 위 변수 채우고 다시 실행하세요.");
  process.exit(1);
} else {
  const mask = (v)=> v ? v.slice(0,4) + "…(" + v.length + ")" : "NA";
  console.log("✅ env ok:",
    "APP_KEY=", mask(process.env.APP_KEY),
    "| APP_SECRET=", mask(process.env.APP_SECRET),
    "| KIS_TR_ID_INDEX=", process.env.KIS_TR_ID_INDEX);
}
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const {
  APP_KEY,
  APP_SECRET,
  KIS_REST = "https://openapi.koreainvestment.com:9443",
  KIS_WS = "ws://ops.koreainvestment.com:21000",
  CUSTTYPE = "P",
  KIS_TR_ID_INDEX,   // KIS 문서의 '국내지수 실시간' TR_ID로 설정해야 함
  POLL_SECONDS = "3",
  PORT = "8080",
} = process.env;

const POLL_MS = Number(POLL_SECONDS) * 1000;

// --- 인증 ---
async function getAccessToken() {
  const url = `${KIS_REST}/oauth2/tokenP`;
  const { data } = await axios.post(
    url,
    { grant_type: "client_credentials", appkey: APP_KEY, appsecret: APP_SECRET },
    { headers: { "Content-Type": "application/json" } }
  );
  return data.access_token;
}

async function getApprovalKey() {
  const url = `${KIS_REST}/oauth2/Approval`;
  const { data } = await axios.post(
    url,
    { grant_type: "client_credentials", appkey: APP_KEY, appsecret: APP_SECRET },
    { headers: { "Content-Type": "application/json" } }
  );
  return data.approval_key;
}

// --- 로컬 WS 서버 ---
const server = http.createServer();
const wss = new WebSocketServer({ server });

function broadcast(obj) {
  const s = JSON.stringify(obj);
  for (const c of wss.clients) if (c.readyState === WebSocket.OPEN) c.send(s);
}

// --- KIS WebSocket (국내: 코스피/코스닥) ---
async function startKisRealtime() {
  const approval_key = await getApprovalKey();
  const ws = new WebSocket(KIS_WS, { perMessageDeflate: false });

  ws.on("open", () => {
    console.log("[KIS-WS] connected");

    const register = (tr_key) =>
      ws.send(JSON.stringify({
        header: { approval_key, custtype: CUSTTYPE, tr_type: "1", "content-type": "utf-8" },
        body: { input: { tr_id: KIS_TR_ID_INDEX, tr_key } },
      }));

    register("0001"); // KOSPI
    register("0002"); // KOSDAQ
  });

  ws.on("message", (buf) => {
    const text = buf.toString();
    if (text.startsWith("0") || text.startsWith("1")) {
      const [flag, tr_id, count, payload] = text.split("|");
      broadcast({ provider: "KIS-WS", flag, tr_id, payload, raw: text });
    } else {
      let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
      broadcast({ provider: "KIS-WS", meta: json });
    }
  });

  ws.on("close", (code) => {
    console.log("[KIS-WS] closed:", code, "→ reconnecting…");
    setTimeout(startKisRealtime, 1500);
  });
  ws.on("error", (e) => console.log("[KIS-WS] error:", e.message));

  ws.on("unexpected-response", (req, res) => {
    console.log("[KIS-WS] unexpected-response:", res.statusCode, res.statusMessage);
    let body = ""; res.on("data", c => body += c); res.on("end", () => console.log("[KIS-WS] body:", body));
  });
  ws.on("close", (code, reason) => {
    console.log("[KIS-WS] closed:", code, reason?.toString());
    setTimeout(startKisRealtime, 1500);
  });
  ws.on("error", (e) => console.log("[KIS-WS] error:", e?.message));
}

// --- (옵션) 해외지수/환율: REST 폴링 → 우리 WS로 중계 ---
async function startPolling() {
  const access = await getAccessToken();
  const baseHeaders = {
    "content-type": "application/json; charset=utf-8",
    authorization: `Bearer ${access}`,
    appkey: APP_KEY,
    appsecret: APP_SECRET,
  };
  const targets = [
    // ↓↓↓ 자리표시자 URL (KIS 문서의 실제 엔드포인트/파라미터로 교체)
    { id: "NASDAQ",  url: `${KIS_REST}/uapi/overseas-stock/v1/quotations/overseas-index-minute?FID_INPUT_ISCD=IXIC&FID_INPUT_HOUR_1=1`, tr_id: "HHDFS00000000" },
    { id: "S&P500",  url: `${KIS_REST}/uapi/overseas-stock/v1/quotations/overseas-index-minute?FID_INPUT_ISCD=SPX&FID_INPUT_HOUR_1=1`, tr_id: "HHDFS00000000" },
    { id: "VIX",     url: `${KIS_REST}/uapi/overseas-stock/v1/quotations/overseas-index-minute?FID_INPUT_ISCD=VIX&FID_INPUT_HOUR_1=1`, tr_id: "HHDFS00000000" },
    { id: "USD/KRW", url: `${KIS_REST}/uapi/overseas-stock/v1/quotations/inquire-exchange?FID_INPUT_ISCD=USDKRW`, tr_id: "HHDFS00000000" },
  ];

  async function pollOnce() {
    try {
      for (const t of targets) {
        const { data } = await axios.get(t.url, { headers: { ...baseHeaders, tr_id: t.tr_id } });
        broadcast({ provider: "KIS-REST", id: t.id, data });
        await new Promise((r) => setTimeout(r, 30));
      }
    } catch (e) {
      broadcast({ provider: "KIS-REST", error: e.message });
    }
  }

  pollOnce();
  setInterval(pollOnce, POLL_MS);
}

// --- 부팅 ---
server.listen(Number(PORT), () => {
  console.log(`🔌 local WS: ws://localhost:${PORT}`);
});
startKisRealtime().catch((e) => console.error("KIS WS boot failed:", e.message));
// startPolling().catch((e) => console.error("Polling boot failed:", e.message));

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ hello: "A-plan realtime bridge ready" }));
});

1
