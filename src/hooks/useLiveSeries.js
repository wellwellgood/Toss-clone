import { useEffect, useState } from "react";

function pickPrice(tick = {}) {
  // 가장 흔한 키 순서대로 시도
  const p =
    tick.price ??
    tick.stck_prpr ??       // 국내(체결가)
    tick.tp ??              // trade price 축약
    tick.trade_price ??
    tick.prc ??
    tick.c ??               // close
    null;
  const n = Number(p);
  return Number.isFinite(n) ? n : null;
}

export default function useLiveSeries({ ticks, code, max = 300 }) {
  const [series, setSeries] = useState([]);
  const price = pickPrice(ticks?.[code]);

  useEffect(() => {
    if (price === null) return;
    setSeries((s) => {
      const t = Date.now();
      if (s.length && s[s.length - 1].price === price) return s;
      const next = [...s, { t, price }];
      return next.length > max ? next.slice(-max) : next;
    });
  }, [price]);

  return series;
}
