// server/index.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 4000;

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

function loadPayments() {
    const filePath = path.join(__dirname, "seed", "payments.json"); // 경로 맞추면 OK
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}

// 전체
app.get("/api/payments", (req, res) => {
    res.json(loadPayments());
});

// ✅ method별 라우트: 반드시 :id 보다 위
app.get("/api/payments/card", (req, res) => {
    const data = loadPayments().filter(p => p.method === "card");
    res.json(data);
});

app.get("/api/payments/account", (req, res) => {
    const data = loadPayments().filter(p => p.method === "account");
    res.json(data);
});

app.get("/api/payments/point", (req, res) => {
    const data = loadPayments().filter(p => p.method === "point");
    res.json(data);
});

// id 단건
app.get("/api/payments/id/:id", (req, res) => {
    const hit = loadPayments().find(p => p.id === req.params.id);
    if (!hit) return res.status(404).json({ error: "Payment not found" });
    res.json(hit);
});

app.listen(PORT, () => {
    console.log(`✅ Mock API: http://localhost:${PORT}`);
});
