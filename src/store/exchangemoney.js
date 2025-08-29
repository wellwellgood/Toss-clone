import { create } from "zustand";

export const exchangemoney = create((set) => ({
    mvKRW: 0,
    mvUSD: 0,
    currency: "KRW",
    setTotals: (mv, usdRate = 1350, currency = "KRW") =>
        set({
            mvKRW: Math.round(mv),
            mvUSD: Math.round(mv / usdRate),
            currency,
        }),
}));