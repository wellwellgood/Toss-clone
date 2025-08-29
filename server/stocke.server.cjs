// server/stocke.server.cjs
// HTTP + WebSocket + Payments REST 통합 서버 (CommonJS)
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const mountPayments = require('./payments.routes.cjs');

const APP_PORT = Number(process.env.PORT) || 8080;
const WS_PATH = process.env.WS_PATH || '/ws';
const MOCK_TICKS = String(process.env.MOCK_TICKS || '1') === '1'; // 데모 틱 발생 여부

// --- Express
const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
mountPayments(app); 

// 헬스체크
app.get('/', (_, res) => res.status(200).send('ok'));

// 결제 Mock API 라우트 장착
mountPayments(app);

// --- HTTP + WS 서버
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: WS_PATH });

// 연결 상태 관리
function heartbeat() { this.isAlive = true; }
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.send(JSON.stringify({ type: 'hello', t: Date.now() }));
});

// ping/pong
const heartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

// 샘플 시세
let quotes = {
  AAPL: { code: 'AAPL', name: '애플', price: 319436, prevClose: 319800 },
  TSLA: { code: 'TSLA', name: '테슬라', price: 465003, prevClose: 464500 },
  NVDA: { code: 'NVDA', name: '엔비디아', price: 1200500, prevClose: 1198000 },
};

// 브로드캐스트 유틸
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of wss.clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

// 데모 틱 발생기
let tickTimer = null;
function startMockTicks() {
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    const keys = Object.keys(quotes);
    const k = keys[Math.floor(Math.random() * keys.length)];
    const q = quotes[k];
    const delta = (Math.random() - 0.5) * 300;
    q.price = Math.max(1, Math.round(q.price + delta));
    broadcast({ type: 'tick', t: Date.now(), data: { ...q } });
  }, 1000);
}

if (MOCK_TICKS) startMockTicks();

// 종료 처리
function shutdown(sig) {
  console.log(`\n${sig} received. closing...`);
  clearInterval(heartbeatInterval);
  clearInterval(tickTimer);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.listen(APP_PORT, () => {
  console.log(`HTTP/WS on :${APP_PORT}  ws path=${WS_PATH}`);
  console.log(`REST    on :${APP_PORT}  e.g. GET /api/payments`);
});
