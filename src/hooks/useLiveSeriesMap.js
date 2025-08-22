import { useEffect, useRef, useState } from "react";


const pickTime = (x) =>
    Number(x?.ts ?? x?.t ?? x?.time ?? x?.timestamp ?? Date.now());

function pickPrice(t = {}) {
    const v = t.price ?? t.stck_prpr ?? t.trade_price ?? t.tp ?? t.prc ?? t.c;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export default function useLiveSeriesMap(ticks, codes, { max = 240, stepMs =0 } = {}) {
    const ref = useRef(new Map());
    const [, setTick] = useState(0);

    useEffect(() => {
        let changed = false;
        for (const code of codes || []) {
            const src = ticks?.[code];
            const p = pickPrice(src);
            if (p == null) continue;


            const prev = ref.current.get(code) || [];
            if (prev.length && prev[prev.length - 1].price === p) continue;
            const raw = pickTime(src);
            const now = stepMs > 0 ? Math.floor(raw / stepMs) * stepMs : raw;
            let next =
            stepMs > 0 && prev.length && prev[prev.length - 1].t === now
            ? prev.slice(0, -1).concat({ t: now, price: p })
            : prev.concat({ t: now, price: p });

            if (next.length > max) next = next.slice(next.length - max);
            ref.current.set(code, next); changed = true;
            changed = true;
        }
        if (changed) setTick((x) => x + 1);
    }, [ticks, JSON.stringify(codes), max]);

    return ref.current; // Map<code, {t,price}[]>
}
