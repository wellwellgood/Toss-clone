// stocke.server.cjs  ← CommonJS 버전
require("dotenv").config();
const http = require("http");
const axios = require("axios");
const WebSocket = require("ws");
const { WebSocketServer } = require("ws");
const path = require("path");



const KIS_MODE = (process.env.APP_KEY || "").startsWith("VT") ? "paper" : "real";
const DEF_REST = KIS_MODE === "paper"
  ? "https://openapivts.koreainvestment.com:29443"
  : "https://openapi.koreainvestment.com:9443";
const DEF_WS = KIS_MODE === "paper"
  ? "wss://ops.koreainvestment.com:31000"
  : "wss://ops.koreainvestment.com:21000";
const KIS_REST = process.env.KIS_REST || DEF_REST;
const KIS_WS   = process.env.KIS_WS   || DEF_WS;

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
  KIS_WS = "wss://ops.koreainvestment.com:21000",
  CUSTTYPE = "P",
  KIS_TR_ID_INDEX,   // KIS 문서의 '국내지수 실시간' TR_ID로 설정해야 함
  POLL_SECONDS = "3",
  PORT = "8080",
} = process.env;

const __RAW_KIS_WS = (process.env.KIS_WS || KIS_WS || "").trim();
const __SANITIZED_KIS_WS = (__RAW_KIS_WS || KIS_WS)
  .replace(/^ws:\/\//i, "wss://")
  .replace(/\/+tryitout.*$/i, ""); // remove any test path segments

const POLL_MS = Number(POLL_SECONDS) * 1000;


const url = require("url");
const restHost = (() => {
  try { return new url.URL(process.env.KIS_REST).host; } catch { return "openapi.koreainvestment.com"; }
})();
const ORIGIN_HEADER = `https://${restHost}`;

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

  // 1) ws 인스턴스 먼저 생성
  const ws = new WebSocket(__SANITIZED_KIS_WS, {
    origin: ORIGIN_HEADER,
    perMessageDeflate: false,
  });

  console.log("[KIS-WS] endpoint =", __SANITIZED_KIS_WS);

  // 2) 핸들러들은 'ws' 생성 직후에 붙인다
  ws.on("open", () => {
    console.log("[KIS-WS] connected");

    // 승인/등록 + 구독 (네가 쓰던 포맷 유지)
    const register = (tr_key) =>
      ws.send(
        JSON.stringify({
          header: {
            approval_key,
            custtype: CUSTTYPE, // "P" or "B"
            tr_type: "1",
            "content-type": "utf-8",
          },
          body: { input: { tr_id: KIS_TR_ID_INDEX, tr_key } },
        })
      );

    register("0001"); // KOSPI
    register("1001"); // KOSDAQ
  });

  ws.on("message", (buf) => {
    const text = buf.toString();
    if (text.startsWith("0") || text.startsWith("1")) {
      const [flag, tr_id, count, payload] = text.split("|");
      broadcast({ provider: "KIS-WS", flag, tr_id, payload, raw: text });
    } else {
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }
      broadcast({ provider: "KIS-WS", meta: json });
    }
  });

  // 응답 본문까지 찍어서 403/401 원인 파악
  ws.on("unexpected-response", (req, res) => {
    try {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => console.error("[KIS-WS] unexpected-response", res.statusCode, body));
    } catch (e) {
      console.error("[KIS-WS] unexpected-response", res.statusCode);
    }
  });

  ws.on("close", (code) => {
    console.warn("[KIS-WS] closed:", code, "→ reconnecting…");
    setTimeout(startKisRealtime, 5000);
  });

  ws.on("error", (e) => {
    console.error("[KIS-WS] error:", e.message);
    try {
      ws.close();
    } catch {}
  });
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

