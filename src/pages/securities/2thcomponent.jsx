// src/pages/.../2thcomponent.jsx
import { Link } from 'react-router-dom';
import styles from '../../css/securities/2thcomponent.module.css';
import useKRW from '../../hooks/securitiesPoFol'; // 기본 export 훅을 이름 그대로 가져오기
import right from './img/right.jpg';

export default function TwoThComponent({ holdings, liveTicks }) {
  // 통화 포맷 훅
  const krw = useKRW({ suffix: "원", showSign: true, digits: 0 });

  // 데이터 소스: props 우선, 없으면 localStorage('holdings') 시도, 최악엔 빈 배열
  const H = holdings ?? (() => {
    try { return JSON.parse(localStorage.getItem("holdings") || "[]"); } catch { return []; }
  })();
  const T = liveTicks ?? {};

  // 포트폴리오 1줄 계산
  let cost = 0, mv = 0;
  for (const h of H) {
    const qty = Number(h?.qty || 0);
    const avg = Number(h?.avg || 0);
    const tick = T[h?.code] || {};
    const px = Number(
      (typeof tick.price === "number" ? tick.price :
       typeof h?.prev_close === "number" ? h.prev_close :
       avg) || 0
    );
    cost += qty * avg;   // 매수원가 합
    mv   += qty * px;    // 평가금액 합
  }
  const pnlAbs  = mv - cost;                         // 총손익(원)
  const pnlRate = cost ? (pnlAbs / cost) * 100 : 0;  // 총손익(%)
  const toneCls = pnlAbs > 0 ? styles.up : pnlAbs < 0 ? styles.down : "";

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.mystock}>
        <div className={styles.stock}>
          <span>내 종목 보기</span>
          <img src={right} alt="" />
        </div>
      </Link>

      {/* 평가금액 */}
      <div className={styles.Account}>{krw.raw(mv)}원</div>

      {/* 포트폴리오 1줄: 총손익/수익률 */}
      <div className={styles.toneCls}>
        {krw(pnlAbs)} ({pnlRate >= 0 ? "+" : ""}{pnlRate.toFixed(2)}%)
      </div>
    </div>
  );
}
