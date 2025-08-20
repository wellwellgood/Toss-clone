// src/pages/.../2thcomponent.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import styles from "../../css/securities/2thcomponent.module.css";
import useKRW from "../../hooks/securitiesPoFol";
import right from "./img/right.jpg";

import useLiveTicks from "../../hooks/useLiveTicks";
import PortfolioToolbar from "./PortfolioToolbar.jsx";
import HoldingsTable from "./HoldingsTable.jsx";
import ActionList from "./ActionList.jsx";

export default function TwoThComponent({ holdings, liveTicks }) {
  const krw = useKRW({ suffix: "원", showSign: true, digits: 0 });

  // props 우선, 없으면 localStorage 보조
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
    () => (H || []).map((h) => h.code).filter(Boolean),
    [H]
  );
  const live = useLiveTicks(import.meta.env.VITE_WS_URL, { codes });
  const T = { ...T0, ...live };

  // 상단 요약 계산
  let cost = 0,
    mv = 0;
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

  // ▼ 새로 추가: 툴바 상태
  const [metric, setMetric] = useState("price"); // "price" | "value"(평가금)
  const [currency, setCurrency] = useState("KRW"); // "KRW" | "USD"

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.mystock}>
        <div className={styles.stock}>
          <span>내 종목보기</span>
          <img src={right} alt="" />
        </div>
      </Link>

      {/* 평가금액 */}
      <div className={styles.Account}>{krw.raw(mv)}원</div>

      {/* 총손익/수익률 */}
      <div className={pnlAbs > 0 ? styles.up : pnlAbs < 0 ? styles.down : ""}>
        {krw(pnlAbs)} ({pnlRate >= 0 ? "+" : ""}
        {pnlRate.toFixed(2)}%)
      </div>

      {/* 정렬/지표/통화 툴바 */}
      <PortfolioToolbar
        metric={metric}
        currency={currency}
        onChangeMetric={setMetric}
        onChangeCurrency={setCurrency}
      />

      {/* 아래 표 + 액션 리스트 */}
      <HoldingsTable holdings={H} liveTicks={T} />
      <ActionList dividendThisMonth={13} />
    </div>
  );
}
