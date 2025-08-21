// stocke.server.cjs
// CommonJS. HTTP + WS on the same port. /ws로 실시간 시세 푸시.
// KIS 연동은 placeholder(브로드캐스트만 호출하면 됨). 없으면 MOCK 틱이 돌아감.

require("dotenv").config();

// --- 시장 감지 + TR/WS 선택 ---
function detectMarket(code = "") {
  if (/^\d{6}$/.test(code)) return "KR";         // 005930
  if (/^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(code)) return "US"; // AAPL, BRK.B
  return "KR";
}

const CONF = {
  KR: {
    WS: process.env.KIS_WS_KR || process.env.KIS_WS,
    TR: {
      tick: process.env.KIS_TR_ID_TICK_KR,
      ob: process.env.KIS_TR_ID_OB_KR,
    },
  },
  US: {
    WS: process.env.KIS_WS_OVS || process.env.KIS_WS,
    TR: {
      tick: process.env.KIS_TR_ID_TICK_OVS,
      ob: process.env.KIS_TR_ID_OB_OVS,
    },
  },
};

// approval_key 캐시(24h 유효)
let APPROVAL_KEY = null;
async function getApprovalKey(fetchImpl = global.fetch) {
  if (APPROVAL_KEY) return APPROVAL_KEY;
  const r = await fetchImpl(`${process.env.KIS_REST}/oauth2/Approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: process.env.APP_KEY,
      secretkey: process.env.APP_SECRET,
    }),
  });
  const j = await r.json();
  if (!j.approval_key) throw new Error("approval_key 실패");
  APPROVAL_KEY = j.approval_key;
  return APPROVAL_KEY;
}

// KIS WS 커넥션을 시장별로 하나씩 유지
const WebSocket = require("ws");
const kisConn = { KR: null, US: null };
const kisReady = { KR: false, US: false };
const pendingSubs = { KR: new Set(), US: new Set() };

async function ensureKIS(market) {
  if (kisConn[market] && kisConn[market].readyState === WebSocket.OPEN) return kisConn[market];

  const key = await getApprovalKey();
  const url = CONF[market].WS;
  if (!url) throw new Error(`WS URL 없음: ${market}`);

  const ws = new WebSocket(url);
  kisConn[market] = ws;
  kisReady[market] = false;

  ws.on("open", () => {
    kisReady[market] = true;
    // 재접속 시 보류된 종목 재구독
    for (const code of pendingSubs[market]) {
      try { subscribeTick(market, code, key); } catch { }
    }
  });

  ws.on("message", (buf) => {
    // TODO: KIS 포맷에 맞게 파싱 후 quotes 갱신 → broadcast(quotes)
    // 예시:
    // const msg = JSON.parse(buf.toString());
    // const { code, price, prevClose, name } = mapFromKIS(msg);
    // quotes[code] = { ...(quotes[code]||{}), price, prevClose, name };
    // broadcast(quotes);
  });

  ws.on("close", () => { kisReady[market] = false; setTimeout(() => ensureKIS(market).catch(() => { }), 1000); });
  ws.on("error", () => { /* 로그만 */ });

  return ws;
}

function buildSubMsg({ approval_key, tr_id, tr_key, custtype = process.env.CUSTTYPE || "P" }) {
  return JSON.stringify({
    header: { approval_key, custtype, tr_type: "1" }, // 1:등록, 2:해제
    body: { input: { tr_id, tr_key } },
  });
}

async function subscribeTick(market, code, approvalKey) {
  const ws = await ensureKIS(market);
  const tr_id = CONF[market].TR.tick;
  if (!tr_id) throw new Error(`TR_ID 없음: ${market}.tick`);
  ws.send(buildSubMsg({ approval_key: approvalKey, tr_id, tr_key: code }));
  pendingSubs[market].add(code);
}

// 외부에서 호출: 배열 codes를 시장별로 나눠 구독
async function subscribeCodes(codes = []) {
  const key = await getApprovalKey();
  const byMkt = { KR: [], US: [] };
  for (const c of codes) byMkt[detectMarket(c)].push(c);
  for (const c of byMkt.KR) await subscribeTick("KR", c, key);
  for (const c of byMkt.US) await subscribeTick("US", c, key);
}


const express = require("express");
const app = express();
app.use(express.json());

// --- 기본 헬스체크/디버그 ---
app.get("/health", (_req, res) => res.type("text/plain").send("ok"));
app.get("/debug/snapshot", (_req, res) => res.json(quotes));

// --- HTTP 서버 + WS 서버 구성 ---
const http = require("http");
const server = http.createServer(app);

const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ server, path: "/ws" });

// --- 연결된 클라이언트 관리 ---
const clients = new Set();

// 초기 스냅샷(필터 지원)
function pickSnapshot(filter) {
  if (!filter || filter.length === 0) return quotes;
  const out = {};
  for (const c of filter) if (quotes[c]) out[c] = quotes[c];
  return out;
}

// 클라이언트 접속
wss.on("connection", (ws, req) => {
  clients.add(ws);
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const codes = (url.searchParams.get("codes") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    ws.send(JSON.stringify(pickSnapshot(codes)));
  } catch (_) { }

  ws.on("close", () => clients.delete(ws));
});

// 모든 클라이언트에 브로드캐스트
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

// --- 시세 메모리(데모용 기본값) ---
let quotes = {
  AAPL: { code: "AAPL", name: "애플", price: 319436, prevClose: 319800 },
  TSLA: { code: "TSLA", name: "테슬라", price: 465003, prevClose: 464500 },
};

// --- MOCK 틱(기본 ON: MOCK_TICKS=0 으로 끄기) ---
let mockTimer = null;
function randomWalk() {
  for (const k of Object.keys(quotes)) {
    const q = quotes[k];
    const delta = Math.round((Math.random() - 0.5) * 1200);
    q.price = Math.max(1, q.price + delta);
  }
  broadcast(quotes);
}
if (process.env.MOCK_TICKS !== "0") {
  mockTimer = setInterval(randomWalk, 1500);
  console.log("[MOCK] random ticks enabled (set MOCK_TICKS=0 to disable)");
}

// --- KIS 연동(필요 시 구현) ---
async function startKIS() {
  const { APP_KEY, APP_SECRET, KIS_REST, KIS_WS } = process.env;
  if (!APP_KEY || !APP_SECRET) {
    console.log("[KIS] credentials missing — mock only");
    return;
  }
  // TODO: KIS WS/REST 연결 후 수신 시
  // 1) quotes[code] = { ...prev, price, prevClose, name }
  // 2) broadcast(quotes)
  console.log("[KIS] placeholder: connect provider and call broadcast() on ticks");
}
startKIS().catch((e) => console.error("[KIS] start error:", e.message));

// --- 서버 시작 ---
const PORT = Number(process.env.PORT) || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP/WS on :${PORT}  path=/ws`);
});


// server.on("upgrade", (req) => console.log("[UPGRADE]", req.url));
// wss.on("connection", (_ws, req) => console.log("[WS CONNECT]", req.url));
// wss.on("error", (e) => console.log("[WSS ERROR]", e.message));