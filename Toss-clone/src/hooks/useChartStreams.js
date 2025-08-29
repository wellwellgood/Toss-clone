// hooks/useChartStreams.js
import { useEffect, useRef, useState } from "react";

function toChartUrl(base, code) {
    try {
        const u = new URL(base, typeof window !== "undefined" ? window.location.href : "http://localhost");
        u.pathname = "/ws";
        u.search = `codes=${encodeURIComponent(code)}`;       // 서버가 codes=를 받는 형태와 일치
        u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
        return u.toString();
    } catch {
        const root = (base || "").replace(/\/ws(\?.*)?$/, "");
        return `${root}/ws/chart?code=${encodeURIComponent(code)}`;
    }
}

// 여러 형식의 가격 키를 안전하게 추출
function pickPrice(t = {}) {
    const v = t.price ?? t.stck_prpr ?? t.trade_price ?? t.tp ?? t.prc ?? t.c;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

// 여러 형식의 시간 키를 안전하게 추출
function pickTime(t = {}) {
    const v = t.t ?? t.ts ?? t.time ?? t.timestamp;
    const n = Number(v);
    return Number.isFinite(n) ? n : Date.now();
}

export default function useChartStreams(wsBaseUrl, codes = [], { max = 240, reconnect = true } = {}) {
    const wsMapRef = useRef(new Map());  // code -> WebSocket
    const seriesRef = useRef(new Map()); // code -> [{t,price}]
    const [, setVer] = useState(0);      // 렌더 트리거

    function openSocket(code) {
        const url = toChartUrl(wsBaseUrl, code);
        const ws = new WebSocket(url);
        wsMapRef.current.set(code, ws);

        ws.onmessage = (e) => {
            try {
                let msg = JSON.parse(String(e.data || "{}"));

                // 래퍼 해제: { data: ... }
                if (msg && typeof msg === "object" && "data" in msg) msg = msg.data;

                // 배열로 오면 해당 code를 우선 선택
                if (Array.isArray(msg)) {
                    msg = msg.find(x => x && (x.code === code || x.symbol === code || x.ticker === code)) || msg[0] || {};
                }

                // 맵 형태 { [code]: tick } 지원
                if (!Array.isArray(msg) && msg && typeof msg === "object" && !("price" in msg) && (msg[code])) {
                    msg = msg[code];
                }

                const p = pickPrice(msg);
                if (p == null) return;
                const t = pickTime(msg);

                const arr = seriesRef.current.get(code) || [];
                if (!arr.length || arr[arr.length - 1].price !== p) {
                    const next = [...arr, { t, price: p }];
                    if (next.length > max) next.splice(0, next.length - max);
                    seriesRef.current.set(code, next);
                    setVer(v => v + 1);
                }
            } catch { /* ignore parse errors */ }
        };

        ws.onclose = () => {
            if (reconnect && codes.includes(code)) {
                setTimeout(() => {
                    if (codes.includes(code) && wsMapRef.current.get(code) === ws) openSocket(code);
                }, 1000);
            }
        };
    }

    function closeSocket(code) {
        const ws = wsMapRef.current.get(code);
        if (ws) {
            try { ws.close(); } catch { }
            wsMapRef.current.delete(code);
        }
    }

    useEffect(() => {
        const want = new Set((codes || []).filter(Boolean));

        // 불필요한 소켓 정리
        for (const c of Array.from(wsMapRef.current.keys())) {
            if (!want.has(c)) closeSocket(c);
        }
        // 신규 구독
        for (const c of want) {
            if (!wsMapRef.current.has(c)) openSocket(c);
        }

        return () => {
            for (const c of Array.from(wsMapRef.current.keys())) closeSocket(c);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wsBaseUrl, JSON.stringify(codes), max, reconnect]);

    return seriesRef.current; // Map<code, Array<{t,price}>>
}
