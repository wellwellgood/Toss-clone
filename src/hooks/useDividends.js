// hooks/useDividends.js
import { useEffect, useState } from "react";

export default function useDividends(codes = []) {
    const [map, setMap] = useState({});
    useEffect(() => {
        if (!codes.length) return;
        const ac = new AbortController();
        (async () => {
            try {
                const qs = encodeURIComponent(codes.join(","));
                const r = await fetch(`/api/dividends?codes=${qs}`, { signal: ac.signal });
                const j = await r.json();
                setMap(j || {});
            } catch { }
        })();
        return () => ac.abort();
    }, [JSON.stringify(codes)]);
    return map; // { CODE: { dps, yield, exDate, payDate } }
}
