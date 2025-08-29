import { Link } from "react-router-dom";
import useKRW from "../../hooks/securitiesPoFol";
import styles from "../../css/securities/actionList.module.css";

export default function ActionList({ dividendThisMonth = 0 }) {
  const krw = useKRW({ suffix: "원", showSign: false, digits: 0 });

  return (
    <div className={styles.list}>
      <Link to="/orders" className={styles.item}>
        <span>주문내역</span>
        <span className={styles.chev}>›</span>
      </Link>
      <Link to="/realized" className={styles.item}>
        <span>판매수익</span>
        <span className={styles.chev}>›</span>
      </Link>
      <Link to="/dividends" className={styles.item}>
        <div className={styles.leftCol}>
          <span>배당금</span>
          <span className={styles.sub}>
            이번 달 {krw.raw(dividendThisMonth)}원
          </span>
        </div>
        <span className={styles.chev}>›</span>
      </Link>
    </div>
  );
}
