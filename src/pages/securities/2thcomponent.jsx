import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/securities/2thcomponent.module.css";
import useKRW from "../../hooks/securitiesPoFol";
import right from "./img/right.jpg";

import useLiveTicks from "../../hooks/useLiveTicks";
import useLiveSeriesMap from "../../hooks/useLiveSeriesMap";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

function Spark({ id, data = [], up }) {
  const gid = `grad-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const safe = data.length
    ? data
    : [
        { t: 0, price: 0 },
        { t: 1, price: 0 },
      ];
  const stroke = up ? "#ef4444" : "#2563eb";
  const top = up ? "#fecaca" : "#bfdbfe";
  const bottom = up ? "#ef4444" : "#2563eb";
  return (
    <div className={styles.spark}>
      <ResponsiveContainer>
        <AreaChart
          data={safe}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={top} stopOpacity={0.9} />
              <stop offset="100%" stopColor={bottom} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            fill={`url(#${gid})`}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TwoThComponent({ holdings, liveTicks }) {
  const krw = useKRW({ suffix: "원", showSign: true, digits: 0 });

  const H =
    holdings ??
    (() => {
      try {
        return JSON.parse(localStorage.getItem("holdings") || "[]");
      } catch {
        return [];
      }
    })();

  const T0 = liveTicks ?? {};
  const codes = useMemo(
    () =>
      (Array.isArray(H) ? H : [])
        .map((h) => h && h.code)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i),
    [H]
  );

  const live = useLiveTicks(import.meta.env.VITE_WS_URL, { codes });
  const T = { ...T0, ...live };

  const seriesMap = useLiveSeriesMap(T, codes, { max: 60 });

  let cost = 0;
  let mv = 0;
  for (const h of H) {
    const qty = Number(h?.qty || 0);
    const avg = Number(h?.avg || 0);
    const tick = T[h?.code] || {};
    const px = Number(
      (typeof tick.price === "number"
        ? tick.price
        : typeof h?.prev_close === "number"
        ? h.prev_close
        : avg) || 0
    );
    cost += qty * avg;
    mv += qty * px;
  }
  const pnlAbs = mv - cost;
  const pnlRate = cost ? (pnlAbs / cost) * 100 : 0;

  const [metric, setMetric] = useState("price");
  const [currency, setCurrency] = useState("KRW");
  const usdRate = Number(import.meta.env.VITE_USD_KRW || 1350);

  const toCur = (v) => (currency === "USD" ? v / usdRate : v);
  const money = (v) =>
    currency === "USD"
      ? `$ ${Math.round(toCur(v)).toLocaleString()}`
      : `${krw.raw(v)}원`;

  const changeRate = (tick, h) => {
    const p = Number(tick?.price ?? h?.prev_close ?? h?.avg ?? 0);
    const y = Number(tick?.prevClose ?? h?.prev_close ?? p);
    if (!p || !y) return 0;
    return ((p - y) / y) * 100;
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.mystock}>
        <div className={styles.stock}>
          <span>내 종목보기</span>
          <img src={right} alt="" />
        </div>
      </Link>

      <div className={styles.totalValue}>{money(mv)}</div>

      <div
        className={`${styles.pnl} ${
          pnlAbs >= 0 ? styles.pnlUp : styles.pnlDown
        }`}
      >
        {pnlAbs >= 0 ? "" : "-"}
        {money(Math.abs(pnlAbs))} ({pnlRate.toFixed(1)}%)
      </div>

      <div className={styles.controls}>
        <button className={styles.sortBtn}>직접 설정한 순 ↑↓</button>

        <div className={styles.segCurrency}>
          <div className={styles.segGroup}>
            {["price", "value"].map((k, i) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`${styles.segBtn} ${
                  metric === k ? styles.segBtnActive : ""
                }`}
              >
                {i === 0 ? "현재가" : "평가금"}
              </button>
            ))}
          </div>

          <div className={styles.currencyGroup}>
            {["USD", "KRW"].map((k) => (
              <button
                key={k}
                onClick={() => setCurrency(k)}
                className={`${styles.currencyBtn} ${
                  currency === k ? styles.currencyBtnActive : ""
                }`}
              >
                {k === "USD" ? "$" : "원"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className={styles.list}>
        {H.map((h) => {
          const tick = T[h.code] || {};
          const price = Number(tick?.price ?? h?.prev_close ?? h?.avg ?? 0);
          const value = price * Number(h.qty || 0);
          const display = metric === "price" ? price : value;
          const chg = changeRate(tick, h);
          return (
            <li key={h.code} className={styles.listItem}>
              <div className={styles.left}>
                <Spark id={h.code} data={seriesMap.get(h.code)} up={chg >= 0} />
                <div>
                  <div className={styles.itemTitle}>{h.name || h.code}</div>
                  <div className={styles.itemSub}>
                    내 평균 {krw.raw(Number(h.avg || 0))}원
                  </div>
                </div>
              </div>
              <div className={styles.right}>
                <div className={styles.value}>{money(display)}</div>
                <div
                  className={`${styles.change} ${
                    chg >= 0 ? styles.changeUp : styles.changeDown
                  }`}
                >
                  {chg >= 0 ? "+" : ""}
                  {chg.toFixed(1)}%
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
