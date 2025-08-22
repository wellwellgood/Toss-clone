import { useEffect, useRef, useState } from "react";

function withCodes(url, codes) {
    if (!codes?.length) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}codes=${encodeURIComponent(codes.join(","))}`;
}

export default function useLiveTicks(wsUrl, { codes = [], reconnect = true, pingInterval = 3000 } = {}) {
    const [ticks, setTicks] = useState({});
    const wsRef = useRef(null);
    const tRef = useRef({ ping: null, retry: null, delay: 5000 });

    useEffect(() => {
        if (!codes?.length) return;

        if (!wsUrl) {
            console.error("[WS] VITE_WS_URL missing");
            return;
        }
        if (!codes?.length) return;
        const url = withCodes(wsUrl, codes);
        
        console.log("[WS URL]", url, { codes });

        let closed = false;

        function open() {
            clearTimeout(tRef.current.retry);
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("[WS OPEN]");
                if (pingInterval) {
                    clearInterval(tRef.current.ping);
                    tRef.current.ping = setInterval(() => {
                        try {
                            if (ws.readyState === WebSocket.OPEN) ws.send('{"type":"ping"}');
                        } catch { }
                    }, pingInterval);
                }
            };

            ws.onmessage = (e) => {
                try {
                    let msg = JSON.parse(String(e.data || ""));
                    if (msg && typeof msg === "object" && "data" in msg) msg = msg.data;
                    const now = Date.now();
                    const obj = Array.isArray(msg)
                        ? Object.fromEntries(
                            (msg || [])
                            .filter(x => x && x.code)
                            .map(x => [x.code, { ...x, ts: Number(x.ts ?? x.t ?? x.time ?? x.timestamp ?? now) }])
                        )
                        : Object.fromEntries(
                            Object.entries(msg || {}).map(
                                ([k, v]) => [k, { ...v, ts: Number(v?.ts ?? v?.t ?? v?.time ?? v?.timestamp ?? now) }]
                            )
                        );
                    if (obj && typeof obj === "object") {
                        setTicks((prev) => ({ ...prev, ...obj }));
                    }
                } catch { }
            };

            ws.onerror = (e) => { console.log("[WS ERROR]", e); };

            ws.onclose = (e) => {
                console.log("[WS CLOSE]", e.code, e.reason);
                clearInterval(tRef.current.ping);
                if (!closed && reconnect) {
                    tRef.current.retry = setTimeout(() => {
                        tRef.current.delay = Math.min((tRef.current.delay || 5000) * 1.8, 5000);
                        open();
                    }, tRef.current.delay || 5000);
                }
            };
        }

        open();

        return () => {
            closed = true;
            clearInterval(tRef.current.ping);
            clearTimeout(tRef.current.retry);
            try { wsRef.current?.close(); } catch { }
        };
    }, [wsUrl, JSON.stringify(codes), reconnect, pingInterval]);

    return ticks;
}
