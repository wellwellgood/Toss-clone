// server/routes/payments.routes.cjs
const express = require('express');
const path = require("path");
const fs = require("fs");

const router = express.Router();

// payments 데이터 로드: payments.json 또는 payment.json 어느 쪽이든 있으면 읽음
function loadPayments() {
  const candidates = [
    // 현재 구조 기준
    path.join(__dirname, "seed", "payments.json"),
    path.join(process.cwd(), "seed", "payments.json"),

    // 루트 직접 배치 대비
    path.join(__dirname, "payments.json"),
    path.join(process.cwd(), "payments.json"),

    // 대체 파일명도 허용
    path.join(__dirname, "seed", "payment.json"),
    path.join(process.cwd(), "seed", "payment.json"),
    path.join(__dirname, "payment.json"),
    path.join(process.cwd(), "payment.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (_) {
        return [];
      }
    }
  }
  return [];
}

router.get("/payments", (_req, res) => {
  res.json(loadPayments());
});

// /api/payments/card, /api/payments/cash 등
router.get("/payments/:method", (req, res) => {
  const method = String(req.params.method || "").toLowerCase();
  const all = loadPayments();
  const keyNames = ["method", "payment_method", "payMethod"]; // 다양성 대응
  const list = all.filter((p) => {
    const val = keyNames.map((k) => (p[k] ?? "")).find((v) => v !== "");
    return String(val).toLowerCase() === method;
  });
  // 404 대신 빈 배열로 응답해 프론트가 쉽게 처리
  res.json(list);
});

router.get('/api/payments', (req, res) => {
  const data = loadPayments();
  const { month, upto } = req.query; // month=YYYY-MM, upto=today
  let out = data;
  if (month) {
    const [y, m] = month.split('-').map(Number);
    out = out.filter(p => {
      const d = new Date(p.approved_at ?? p.created_at ?? p.time);
      return d.getUTCFullYear() === y && (d.getUTCMonth() + 1) === m;
    });
  }
  if (upto === 'today') {
    const n = new Date();
    const cutoff = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 23, 59, 59, 999);
    out = out.filter(p => Date.parse(p.approved_at ?? p.created_at ?? p.time) <= cutoff);
  }
    res.json(out);
});

router.get('/api/payments/card', (req, res) => {
  const { month, upto } = req.query;
  let list = loadPayments().filter(p => p.method === 'card');
  if (month || upto) {
    const [y, m] = (month ?? '').split('-').map(Number);
    const n = new Date();
    const cutoff = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 23, 59, 59, 999);
    list = list.filter(p => {
      const d = new Date(p.approved_at ?? p.created_at ?? p.time);
      const inMonth = month ? (d.getUTCFullYear() === y && (d.getUTCMonth() + 1) === m) : true;
      const inCutoff = upto === 'today' ? (+d <= cutoff) : true;
      return inMonth && inCutoff;
    });
  }
  res.json(list);
});

module.exports = router;
