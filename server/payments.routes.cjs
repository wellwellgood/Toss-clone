/* server/payments.routes.cjs */
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// ---- 데이터 로더: payment(s).json 어느 것이든 허용 ----
function loadPayments() {
  const candidates = [
    path.join(__dirname, 'payments.json'),
    path.join(__dirname, 'payment.json'),
    path.join(__dirname, 'seed', 'payments.json'),
    path.join(process.cwd(), 'server', 'payments.json'),
    path.join(process.cwd(), 'server', 'payment.json'),
    path.join(process.cwd(), 'server', 'seed', 'payments.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const txt = fs.readFileSync(p, 'utf8');
        const data = JSON.parse(txt);
        if (Array.isArray(data)) return data;
        return [];
      } catch {
        return [];
      }
    }
  }
  return [];
}

// GET /api/payments  -> 전체
router.get('/payments', (_req, res) => {
  const all = loadPayments();
  res.json(all);
});

// GET /api/payments/:method  -> 결제수단별(card/cash 등)
router.get('/payments/:method', (req, res) => {
  const methodParam = String(req.params.method || '').toLowerCase();
  const all = loadPayments();

  // 다양한 필드명 대응
  const methodKeys = ['method', 'payment_method', 'payMethod', 'type'];
  const filtered = all.filter((p) => {
    for (const k of methodKeys) {
      if (p && Object.prototype.hasOwnProperty.call(p, k)) {
        const v = String(p[k] ?? '').toLowerCase();
        if (v === methodParam) return true;
      }
    }
    return false;
  });

  // 프론트 사용 편의를 위해 200 + []로 통일
  res.json(filtered);
});

module.exports = router; // ← 반드시 Router 단일 export
