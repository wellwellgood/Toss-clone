// server/routes/payments.routes.cjs
const express = require('express');
const path = require("path");
const fs = require("fs");

const router = express.Router();

// payments 데이터 로드: payments.json 또는 payment.json 어느 쪽이든 있으면 읽음
function loadPayments() {
  const candidates = [
    path.join(__dirname, "..", "payments.json"),
    path.join(__dirname, "..", "payment.json"),
    path.join(process.cwd(), "server", "payments.json"),
    path.join(process.cwd(), "server", "payment.json"),
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

module.exports = router;
