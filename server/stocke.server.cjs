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

const fetch = (...a) => import("node-fetch").then(({default: f}) => f(...a));


app.get("/api/dividends", async (req, res) => {
  try {
    const codes = String(req.query.codes||"").split(",").filter(Boolean);
    if (!codes.length) return res.json({});
    // ① KIS 토큰 가져오기(네 환경에 맞게 구현)
    const accessToken = process.env.KIS_ACCESS_TOKEN; // 또는 캐시된 토큰
    // ② 코드별로 KIS 재무/비율 API 호출 → DPS/배당수익률 추출
    const out = {};
    for (const code of codes) {
      // 아래는 “의사 코드”. 실제 KIS 엔드포인트와 필드명은 문서대로 매핑해라.
      // (예: [국내주식] 재무비율/기타주요비율 or 주식기본조회에 DPS, 배당수익률 제공)
      const r = await fetch("https://openapi.koreainvestment.com:9443/...", {
        method: "GET",
        headers: {
          "authorization": `Bearer ${accessToken}`,
          "appkey": process.env.KIS_APPKEY,
          "appsecret": process.env.KIS_APPSECRET,
          "tr_id": "...",           // KIS 문서 기준
        }
      });
      const j = await r.json();
      // 문서의 필드명에 맞춰 파싱
      const dps   = Number(j?.output?.dps ?? j?.output?.DVD_PTS ?? 0);       // 주당배당금
      const divYield = Number(j?.output?.div_yield ?? j?.output?.DVD_YIELD ?? 0); // 배당수익률(%)
      const ex    = j?.output?.ex_div_date || null;  // 배당락일(있으면)
      const pay   = j?.output?.pay_date   || null;   // 지급일(있으면)
      out[code] = { dps, yield:divYield, exDate: ex, payDate: pay };
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

server.listen(process.env.PORT || 8080, () => {
  console.log("HTTP/WS :", process.env.PORT || 8080);
});
