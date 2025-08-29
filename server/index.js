'use strict';
/**
 * server/payments.routes.cjs
 * 결제 Mock API 라우트 모듈
 */
const fs = require('fs');
const path = require('path');

function loadPayments() {
    const filePath = path.join(__dirname, 'seed', 'payments.json'); // server/seed/payments.json
    if (!fs.existsSync(filePath)) {
        throw new Error(`payments.json not found at ${filePath}. 먼저 seed-generator.js를 실행하세요.`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = function mountPayments(app) {
    // 전체
    app.get('/api/payments', (req, res) => {
        try {
            res.json(loadPayments());
        } catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });

    // method별
    app.get('/api/payments/card', (req, res) => {
        try {
            res.json(loadPayments().filter(p => p.method === 'card'));
        } catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });

    app.get('/api/payments/account', (req, res) => {
        try {
            res.json(loadPayments().filter(p => p.method === 'account'));
        } catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });

    app.get('/api/payments/point', (req, res) => {
        try {
            res.json(loadPayments().filter(p => p.method === 'point'));
        } catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });

    // 단건
    app.get('/api/payments/id/:id', (req, res) => {
        try {
            const hit = loadPayments().find(p => p.id === req.params.id);
            if (!hit) return res.status(404).json({ error: 'Payment not found' });
            res.json(hit);
        } catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });
};
