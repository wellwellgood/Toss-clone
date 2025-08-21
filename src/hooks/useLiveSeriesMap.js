import { useEffect, useRef, useState } from "react";

function pickPrice(t = {}) {
    const v = t.price ?? t.stck_prpr ?? t.trade_price ?? t.tp ?? t.prc ?? t.c;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export default function useLiveSeriesMap(ticks, codes, { max = 60 } = {}) {
    const ref = useRef(new Map());
    const [, setTick] = useState(0);

    useEffect(() => {
        let changed = false;
        const now = Date.now();
        for (const code of codes || []) {
            const p = pickPrice(ticks?.[code]);
            if (p == null) continue;
            const arr = ref.current.get(code) || [];
            if (arr.length && arr[arr.length - 1].price === p) continue;
            arr.push({ t: now, price: p });
            if (arr.length > max) arr.splice(0, arr.length - max);
            ref.current.set(code, arr);
            changed = true;
        }
        if (changed) setTick((x) => x + 1);
    }, [ticks, JSON.stringify(codes), max]);

    return ref.current; // Map<code, {t,price}[]>
}
