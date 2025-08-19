import { useEffect, useRef, useState } from "react";

function resolveWS(base, codes) {
    if (base) return withCodes(base, codes);

    const isHttps = window.location.protocol === "https:";
    const proto = isHttps ? "wss" : "ws";

    // 1) 개발(vite) : /ws 프록시 경유 -> ws(s)://host[:port]/ws
    if (/(localhost|127\.0\.0\.1)/.test(window.location.hostname)) {
        return withCodes(`${proto}://${window.location.host}/ws`, codes);
    }
    // 2) 배포(같은 도메인) : /ws
    return withCodes(`${proto}://${window.location.host}/ws`, codes);
}
function withCodes(url, codes) {
    if (!codes?.length) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}codes=${codes.join(",")}`;
}

export default function useLiveTicks(
    urlFromEnv, // import.meta.env.VITE_WS_URL 가능
    { codes = [], reconnect = true, pingInterval = 15000 } = {}
) {
    const [ticks, setTicks] = useState({});
    const wsRef = useRef(null);
    const tRef = useRef({ ping: null, retry: null, delay: 800 });

    useEffect(() => {
        const url = resolveWS(urlFromEnv, codes);
        let ws;

        const open = () => {
            clearTimeout(tRef.current.retry);
            ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                try { if (codes.length) ws.send(JSON.stringify({ type: "subscribe", codes })); } catch { }
                if (pingInterval) {
                    tRef.current.ping = setInterval(() => {
                        try { ws.readyState === 1 && ws.send('{"type":"ping"}'); } catch { }
                    }, pingInterval);
                }
            };

            ws.onmessage = (e) => {
                try {
                    let msg = JSON.parse(e.data);
                    if (msg && typeof msg === "object" && "data" in msg) msg = msg.data;
                    const obj = Array.isArray(msg)
                        ? Object.fromEntries(msg.filter(x => x?.code).map(x => [x.code, x]))
                        : msg;
                    if (obj && typeof obj === "object") setTicks((p) => ({ ...p, ...obj }));
                } catch { }
            };

            ws.onclose = () => {
                clearInterval(tRef.current.ping);
                if (reconnect) {
                    tRef.current.retry = setTimeout(() => {
                        tRef.current.delay = Math.min(tRef.current.delay * 1.8, 5000);
                        open();
                    }, tRef.current.delay);
                }
            };
            ws.onerror = () => { try { ws.close(); } catch { } };
        };

        open();
        return () => {
            clearInterval(tRef.current.ping);
            clearTimeout(tRef.current.retry);
            try { wsRef.current?.close(); } catch { }
        };
    }, [urlFromEnv, JSON.stringify(codes), pingInterval, reconnect]);

    return ticks;
}
