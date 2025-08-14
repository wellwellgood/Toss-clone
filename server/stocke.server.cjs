// stocke.server.clean.cjs
// CommonJS only. Single HTTP listen. WS shares HTTP server socket.
// Render-safe: uses process.env.PORT, no auto-increment on Render.
// Minimal placeholders for your existing logic (broadcast, KIS connect, etc).

require("dotenv").config();
const http = require("http");
const axios = require("axios");
const WebSocket = require("ws");
const { WebSocketServer } = require("ws");
const { URL } = require("url");

function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }


// ---------- ENV (no duplicate declarations) ----------
const {
  APP_KEY,
  APP_SECRET,
  KIS_TR_ID_INDEX,
  CUSTTYPE = "P",
  KIS_REST: ENV_KIS_REST,
  KIS_WS:   ENV_KIS_WS,
  POLL_SECONDS = "3",
  PORT: ENV_PORT,
  INDEX_KEYS,
} = process.env;

const IS_RENDER = !!process.env.RENDER;
const PORT = Number(ENV_PORT || 8080);

// ---------- Mode & endpoints (no redeclare) ----------
const KIS_MODE = (APP_KEY || "").startsWith("VT") ? "paper" : "real";
const DEF_REST = KIS_MODE === "paper"
  ? "https://openapivts.koreainvestment.com:29443"
  : "https://openapi.koreainvestment.com:9443";
const DEF_WS = KIS_MODE === "paper"
  ? "wss://ops.koreainvestment.com:31000"
  : "wss://ops.koreainvestment.com:21000";

const KIS_REST = ENV_KIS_REST || DEF_REST;
const KIS_WS   = ENV_KIS_WS   || DEF_WS;

// Normalize WS url (force wss, remove /tryitout)
const __RAW_KIS_WS = (process.env.KIS_WS || KIS_WS || "").trim();
const __SANITIZED_KIS_WS = (__RAW_KIS_WS || KIS_WS)
  .replace(/^ws:\/\//i, "wss://")
  .replace(/\/+tryitout.*$/i, "");

// Dynamic Origin from KIS_REST
let __host; try { __host = new URL(KIS_REST).host; } catch { __host = "openapi.koreainvestment.com"; }
const ORIGIN_HEADER = `https://${__host}`;

console.log("✅ env ok: APP_KEY=", (APP_KEY||"").slice(0,4)+"…", "| KIS_TR_ID_INDEX=", KIS_TR_ID_INDEX);
console.log("🔌 local WS will bind on:", `ws://localhost:${PORT}`);
console.log("[KIS-WS] endpoint =", __SANITIZED_KIS_WS, "| origin =", ORIGIN_HEADER);

// ---------- HTTP + WS boot (single listen) ----------
let __BOOTED = false;
let serverRef = null;
let wssRef = null;

function startServerOnce() {
  if (__BOOTED) return;
  __BOOTED = true;

  const server = http.createServer((req, res) => {
    if (req.url === "/health") { res.writeHead(200); res.end("ok"); return; }
    res.writeHead(200); res.end("KIS WS server up");
  });

  server.on("error", (err) => {
    if (!IS_RENDER && err && err.code === "EADDRINUSE") {
      console.error(`EADDRINUSE on :${PORT}. Stop the other process or change PORT.`);
      process.exit(1);
    } else {
      console.error("listen error:", err);
      process.exit(1);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Local WS listening on ws://localhost:${PORT}`);
    const wss = new WebSocketServer({ server }); // share HTTP socket — DO NOT rebind by { port }
    serverRef = server;
    wssRef = wss;
    attachWsHandlers(wss); // your handlers here
    connectKIS();          // kick off KIS (optional)
  });
}

startServerOnce();

// ---------- WS handlers (attach on wssRef) ----------
function broadcast(obj) {
  const s = typeof obj === "string" ? obj : JSON.stringify(obj);
  wssRef?.clients?.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(s);
  });
}

function attachWsHandlers(wss) {
  wss.on("connection", (sock) => {
    console.log("📡 WS client connected");
    sock.on("close", () => console.log("🔌 WS client disconnected"));
  });
}

// ---------- KIS connection (minimal, keep your own message format) ----------
async function getApprovalKey() {
  try {
    const url = `${KIS_REST}/oauth2/Approval`;
    const { data } = await axios.post(url, {
      grant_type: "client_credentials",
      appkey: APP_KEY,
      appsecret: APP_SECRET,
      secretkey: APP_SECRET
    }, { headers: {
      "Content-Type": "application/json; charset=utf-8",
      'appkey': APP_KEY,
      'appsecret': APP_SECRET
    } });
    if (!data?.approval_key) throw new Error("No approval_key in response");
    return data.approval_key;
  } catch (e) {
    console.error("[KIS] approval error:", e?.response?.status, e?.response?.data || e.message);
    throw e;
  }
}

async function connectKIS() {
  try {
    const approval = await getApprovalKey();
    console.log("[KIS] approval_key OK");

    const ws = new WebSocket(__SANITIZED_KIS_WS, {
      origin: ORIGIN_HEADER,
      perMessageDeflate: false,
    });

    ws.on("open", () => {
      console.log("[KIS-WS] connected");
      // Try multiple TR candidates for index streaming. You can pin via .env KIS_TR_ID_INDEX / INDEX_KEYS
      const trCandidates = uniq([KIS_TR_ID_INDEX, "H0STASP0", "H0STCNT0", "H0STANP0", "H0STASP1"]);
      const keyCandidates = uniq((INDEX_KEYS || "1001").split(",").map(s=>s.trim()));
      const packetFor = (tr_id, tr_key) => ({
        header: {
          approval_key: approval,
          custtype: CUSTTYPE,
          tr_type: "1",
          "content-type": "application/json",
          tr_id
        },
        body: { input: { tr_id, tr_key } }
      });
      let sent = 0;
      for (const tr_id of trCandidates) {
        for (const tr_key of keyCandidates) {
          try {
            const pkt = packetFor(tr_id, tr_key);
            ws.send(JSON.stringify(pkt));
            sent++;
          } catch {}
        }
      }
      console.log("[KIS-WS] subscribe packets sent:", sent, "TRs=", trCandidates, "keys=", keyCandidates);
    });

    ws.on("message", (buf) => {
      const text = buf.toString();
      if (text) console.log("[KIS-WS] recv:", text.slice(0,120).replace(/\n/g," "));
      broadcast({ provider: "KIS-WS", raw: text });
    });

    ws.on("unexpected-response", (req, res) => {
      try {
        res.setEncoding("utf8"); let body = "";
        res.on("data", (c) => body += c);
        res.on("end", () => console.error("[KIS-WS] unexpected-response", res.statusCode, body));
      } catch (e) {
        console.error("[KIS-WS] unexpected-response", res.statusCode);
      }
    });

    ws.on("close", (code) => {
      console.warn("[KIS-WS] closed:", code, "→ reconnecting in 5s");
      setTimeout(connectKIS, 5000);
    });

    ws.on("error", (e) => {
      console.error("[KIS-WS] error:", e.message);
      try { ws.close(); } catch {}
    });

  } catch (e) {
    console.error("[KIS] connect error:", e.message, "→ retry in 5s");
    setTimeout(connectKIS, 5000);
  }
}

// Export for tests/other modules if needed
module.exports = { server: () => serverRef, wss: () => wssRef };
