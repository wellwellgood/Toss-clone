// src/pages/.../HoldingsTable.jsx
import useKRW from "../../hooks/securitiesPoFol";
import styles from "../../css/securities/holdingsTable.module.css";

export default function HoldingsTable({
  holdings = [],
  liveTicks = {},
  metric = "price", // "price" | "value"
  currency = "KRW", // "KRW" | "USD"
  fx = 1350, // KRW→USD 환율(임시)
}) {
  const krw = useKRW({ suffix: "원", showSign: false, digits: 0 });
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className={styles.table}>
      {holdings.map((h) => {
        const code = h.code || h.symbol || h.ticker || h.isin || h.cd;
        const tick = code ? liveTicks[code] || {} : {};
        const price = Number.isFinite(tick.price)
          ? Number(tick.price)
          : typeof h?.prev_close === "number"
          ? h.prev_close
          : h?.avg || 0;

        const qty = Number(h?.qty ?? 0) || 0;
        const value = price * qty;

        const prevClose =
          typeof h?.prev_close === "number" ? h.prev_close : price;
        const rate = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        const tone =
          rate > 0 ? styles.up : rate < 0 ? styles.down : styles.flat;

        const display = metric === "value" ? value : price;
        const text =
          currency === "USD"
            ? usd.format(display / fx)
            : `${krw.raw(display)}원`;

        return (
          <div className={styles.row} key={h.code}>
            <div className={`${styles.mark} ${tone}`} />
            <div className={styles.left}>
              <div className={styles.name}>{h.name}</div>
              <div className={styles.avg}>내 평균 {krw.raw(h.avg)}원</div>
            </div>
            <div className={styles.right}>
              <div className={styles.price}>{text}</div>
              <div className={`${styles.rate} ${tone}`}>
                {rate >= 0 ? "+" : ""}
                {rate.toFixed(1)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
