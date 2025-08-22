// stocke.server.cjs  (CommonJS 전용)
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);

app.get("/", (_, res) => res.status(200).send("ok"));

// 데모 시세
let quotes = {
  AAPL: { code: "AAPL", name: "애플",   price: 319436, prevClose: 319800 },
  TSLA: { code: "TSLA", name: "테슬라", price: 465003, prevClose: 464500 },
  PSTV: { code: "PSTV", name: "플러스 테라퓨틱스", price: 675, prevclose: 781},
};

// 옵션
const MOCK   = process.env.MOCK_TICKS !== "0";     // "0"이면 모의틱 꺼짐
const TICKMS = Number(process.env.TICK_MS || 1000);

// WebSocket 업그레이드 (path 단일화)
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const u = new URL(req.url, "http://localhost");
  const subs = (u.searchParams.get("codes") || "").split(",").filter(Boolean);
  const codes = subs.length ? subs : Object.keys(quotes);

  // 초기 스냅샷
  const snap = Object.fromEntries(
    codes.map((c) => {
      const q = quotes[c] ?? (quotes[c] = { code: c, name: c, price: 0, prevClose: null });
      return [c, { code: c, price: q.price, prevClose: q.prevClose, ts: Date.now() }];
    })
  );
  try { ws.send(JSON.stringify(snap)); } catch {}

  // 모의 틱
  let timer = null;
  if (MOCK) {
    timer = setInterval(() => {
      const frame = Object.fromEntries(
        codes.map((c) => {
          const q = quotes[c] ?? (quotes[c] = { code: c, name: c, price: 0, prevClose: null });
          q.price = Math.max(1, q.price + Math.floor(Math.random() * 40 - 20));
          return [c, { code: c, price: q.price, prevClose: q.prevClose, ts: Date.now() }];
        })
      );
      try { ws.send(JSON.stringify(frame)); } catch {}
    }, TICKMS);
  }

  ws.on("close", () => { if (timer) clearInterval(timer); });
});

server.listen(process.env.PORT || 8080, () => {
  console.log("HTTP/WS :", process.env.PORT || 8080);
});
