import styles from "../../css/securities/portfolioToolbar.module.css";

export default function PortfolioToolbar({
  metric = "price", // "price" | "value"
  currency = "KRW", // "KRW" | "USD"
  onChangeMetric,
  onChangeCurrency,
}) {
  return (
    <div className={styles.wrap}>
      <span className={styles.sort}>
        직접 설정한 순 <span className={styles.arrow}>↕</span>
      </span>
      <div className={styles.right}>
        <div className={styles.group} role="tablist" aria-label="지표">
          <button
            type="button"
            className={`${styles.seg} ${
              metric === "price" ? styles.active : ""
            }`}
            onClick={() => onChangeMetric?.("price")}
            aria-pressed={metric === "price"}
          >
            현재가
          </button>
          <button
            type="button"
            className={`${styles.seg} ${
              metric === "value" ? styles.active : ""
            }`}
            onClick={() => onChangeMetric?.("value")}
            aria-pressed={metric === "value"}
          >
            평가금
          </button>
        </div>

        <div className={styles.group} role="tablist" aria-label="통화">
          <button
            type="button"
            className={`${styles.seg} ${
              currency === "USD" ? styles.active : ""
            }`}
            onClick={() => onChangeCurrency?.("USD")}
            aria-pressed={currency === "USD"}
          >
            $
          </button>
          <button
            type="button"
            className={`${styles.seg} ${
              currency === "KRW" ? styles.active : ""
            }`}
            onClick={() => onChangeCurrency?.("KRW")}
            aria-pressed={currency === "KRW"}
          >
            원
          </button>
        </div>
      </div>
    </div>
  );
}
