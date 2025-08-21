import { useEffect, useRef, useState } from "react";

function withCodes(url, codes) {
    if (!codes?.length) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}codes=${encodeURIComponent(codes.join(","))}`;
}

export default function useLiveTicks(
    urlFromEnv,
    { codes = [], reconnect = true, pingInterval = 15000 } = {}
) {
    const [ticks, setTicks] = useState({});
    const wsRef = useRef(null);
    const tRef = useRef({ ping: null, retry: null, delay: 800 });

    useEffect(() => {
        if (!codes?.length) return;

        const url = withCodes(
            urlFromEnv ||
            `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`,
            codes
        );
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
                    const obj = Array.isArray(msg)
                        ? Object.fromEntries((msg || []).filter(x => x && x.code).map(x => [x.code, x]))
                        : msg;
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
                        tRef.current.delay = Math.min((tRef.current.delay || 800) * 1.8, 5000);
                        open();
                    }, tRef.current.delay || 800);
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
    }, [urlFromEnv, JSON.stringify(codes), reconnect, pingInterval]);

    localStorage.setItem('holdings',
        JSON.stringify([{ code:"005930", name:"삼성전자", qty:10, avg:70000, prev_close:80000 }])
    );

    return ticks;
}
