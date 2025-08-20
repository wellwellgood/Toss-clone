// stocke.server.cjs
// CommonJS. HTTP + WS on the same port. /ws로 실시간 시세 푸시.
// KIS 연동은 placeholder(브로드캐스트만 호출하면 됨). 없으면 MOCK 틱이 돌아감.

require("dotenv").config();

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
  } catch (_) {}

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


server.on("upgrade", (req) => console.log("[UPGRADE]", req.url));
wss.on("connection", (_ws, req) => console.log("[WS CONNECT]", req.url));
wss.on("error", (e) => console.log("[WSS ERROR]", e.message));