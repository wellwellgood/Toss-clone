// src/components/securities/2thcomponent.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/securities/2thcomponent.module.css";
import useKRW from "../../hooks/securitiesPoFol";
import useLiveTicks from "../../hooks/useLiveTicks";
import useLiveSeriesMap from "../../hooks/useLiveSeriesMap";
import useDividends from "../../hooks/useDividends";
import { AreaChart, Area } from "recharts";
import { exchangemoney } from "../../store/exchangemoney";

// assets
import right from "./img/right.jpg";
import apple from "./img/1.png";
import tesla from "./img/2.png";
import pstv from "./img/3.png";

/* ======================= constants & helpers ======================= */
const LOGO_MAP = { AAPL: apple, TSLA: tesla, PSTV: pstv };
const logoFor = (code) => LOGO_MAP[String(code || "").toUpperCase()] || "";

const SORTS = [
  { key: "user", label: "직접 설정한 순" },
  { key: "nameAsc", label: "가나다순" },
  { key: "gainAsc", label: "총 수익 낮은 순" },
  { key: "gainDesc", label: "총 수익 높은 순" },
  { key: "valAsc", label: "평가금액 낮은 순" },
  { key: "valDesc", label: "평가금액 높은 순" },
  { key: "priceAsc", label: "일간 수익률 낮은 순" },
  { key: "priceDesc", label: "일간 수익률 높은 순" },
];
const SORT_LABEL = Object.fromEntries(SORTS.map((s) => [s.key, s.label]));

const curPrice = (ticks, h) => Number(ticks[h.code]?.price ?? h.prev_close ?? h.avg ?? 0);
const prevBase = (ticks, h) =>
  Number.isFinite(ticks[h.code]?.prevClose)
    ? Number(ticks[h.code].prevClose)
    : Number(h.prev_close ?? h.avg ?? 0);

const gainRate = (ticks, h) => {
  const p = curPrice(ticks, h);
  const base = prevBase(ticks, h);
  return base ? ((p - base) / base) * 100 : 0;
};

const valuation = (ticks, h) => {
  const qty = Number(h.qty ?? h.quantity ?? h.shares ?? 0);
  return qty * curPrice(ticks, h);
};

function Spark({ id, data = [], up }) {
  const gid = `grad-${String(id).replace(/[^\w-]/g, "")}`;
  const series =
    data?.length > 0
      ? data
      : [
          { t: 0, price: 0 },
          { t: 1, price: 0 },
        ];
  const stroke = up ? "#ef4444" : "#2563eb";
  return (
    <AreaChart width={120} height={36} data={series}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="price"
        stroke={stroke}
        strokeWidth={2}
        fill={`url(#${gid})`}
        isAnimationActive={false}
      />
    </AreaChart>
  );
}

/* ======================= component ======================= */
export default function TwoThComponent({ holdings }) {
  const pushTotals = exchangemoney((s) => s.setTotals);
  const krw = useKRW({ suffix: "원", showSign: true, digits: 0 });

  // 기본 데이터
  const holdingsList =
    holdings && holdings.length
      ? holdings
      : [
          { code: "AAPL", name: "애플", qty: 0.016873, avg: 314_462, prev_close: 350_737 },
          { code: "TSLA", name: "테슬라", qty: 0.000163, avg: 446_706, prev_close: 668_711 },
          { code: "PSTV", name: "플러스 테라퓨틱스", qty: 12, avg: 675, prev_close: 781 },
        ];

  const codes = useMemo(
    () => [...new Set(holdingsList.map((x) => x.code).filter(Boolean))],
    [holdingsList]
  );

  // 실시간 관련
  const ticks = useLiveTicks(import.meta.env.VITE_WS_URL, { codes, minGapMs: 0 });
  const seriesMap = useLiveSeriesMap(ticks, codes, { max: 600, stepMs: 0 });
  const dividends = useDividends(codes);

  // UI 상태
  const [sortKey, setSortKey] = useState("user");
  const [sortOpen, setSortOpen] = useState(false);
  const [metric, setMetric] = useState("price"); // "price" | "value"
  const [currency, setCurrency] = useState("KRW"); // "USD" | "KRW"
  const dropRef = useRef(null);

  // 드롭다운 외부 클릭/ESC
  useEffect(() => {
    const onDoc = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setSortOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // 파생: 정렬 리스트
  const sorted = useMemo(() => {
    const arr = [...holdingsList];
    switch (sortKey) {
      case "nameAsc":
        arr.sort((a, b) => (a.name || a.code || "").localeCompare(b.name || b.code || "", "ko"));
        break;
      case "priceAsc":
        arr.sort((a, b) => curPrice(ticks, a) - curPrice(ticks, b));
        break;
      case "priceDesc":
        arr.sort((a, b) => curPrice(ticks, b) - curPrice(ticks, a));
        break;
      case "gainAsc":
        arr.sort((a, b) => gainRate(ticks, a) - gainRate(ticks, b));
        break;
      case "gainDesc":
        arr.sort((a, b) => gainRate(ticks, b) - gainRate(ticks, a));
        break;
      case "valAsc":
        arr.sort((a, b) => valuation(ticks, a) - valuation(ticks, b));
        break;
      case "valDesc":
        arr.sort((a, b) => valuation(ticks, b) - valuation(ticks, a));
        break;
      default:
        break; // user
    }
    return arr;
  }, [holdingsList, sortKey, ticks]);

  // 파생: 총투자/평가
  const { cost, mv } = useMemo(() => {
    return holdingsList.reduce(
      (acc, h) => {
        const qty = Number(h.qty || 0);
        const avg = Number(h.avg || 0);
        const px = Number(ticks[h.code]?.price ?? h.prev_close ?? avg ?? 0);
        acc.cost += qty * avg;
        acc.mv += qty * px;
        return acc;
      },
      { cost: 0, mv: 0 }
    );
  }, [holdingsList, ticks]);

  const pnlAbs = mv - cost;
  const pnlRate = cost ? (pnlAbs / cost) * 100 : 0;

  // 통화
  const usdRate = Number(import.meta.env.VITE_USD_KRW || 1350);
  const toCur = (v) => (currency === "USD" ? v / usdRate : v);
  const money = (v) => (currency === "USD" ? `$ ${Math.round(toCur(v)).toLocaleString()}` : `${krw.raw(v)}원`);

  // 파생: 월 배당 합계
  const monthlyDiv = useMemo(() => {
    return Math.round(
      holdingsList.reduce((sum, h) => {
        const qty = Number(h?.qty || 0);
        const price = Number(ticks[h.code]?.price ?? h?.prev_close ?? h?.avg ?? 0);
        const dps = Number(dividends?.[h.code]?.dps ?? 0);
        const dy = Number(dividends?.[h.code]?.divYield ?? dividends?.[h.code]?.yield ?? 0);
        const annualPerShare = dps > 0 ? dps : dy > 0 && price > 0 ? price * (dy / 100) : 0;
        return sum + (annualPerShare * qty) / 12;
      }, 0)
    );
  }, [holdingsList, ticks, dividends]);

  // 합계 전파
  useEffect(() => {
    pushTotals(mv, usdRate, currency);
  }, [mv, usdRate, currency, pushTotals]);

  return (
    <div className={styles.container}>
      {/* 상단 합계 */}
      <div className={styles.header}>
        <Link to="/" className={styles.mystock}>
          <div className={styles.stock}>
            <span>내 종목보기</span>
            <img src={right} alt="" />
          </div>
        </Link>
        <div className={styles.pricestock}>
          <div className={styles.totalValue}>{money(mv)}</div>
          <div className={`${styles.pnl} ${pnlAbs >= 0 ? styles.pnlUp : styles.pnlDown}`}>
            {pnlAbs >= 0 ? "" : "-"}
            {money(Math.abs(pnlAbs))} ({pnlRate.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className={styles.controls}>
        <div className={styles.dropdown} ref={dropRef}>
          <button
            className={styles.sortBtn}
            onClick={() => setSortOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            {SORT_LABEL[sortKey]} <span className={styles.caret}>{sortOpen ? "↑" : "↓"}</span>
          </button>
          {sortOpen && (
            <ul className={styles.menu} role="listbox" aria-label="정렬 기준 선택">
              {SORTS.map((s) => (
                <li key={s.key}>
                  <button
                    className={styles.menuItem}
                    role="option"
                    aria-selected={sortKey === s.key}
                    onClick={() => {
                      setSortKey(s.key);
                      setSortOpen(false);
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.segCurrency}>
          <div className={styles.segGroup}>
            {["price", "value"].map((k, i) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`${styles.segBtn} ${metric === k ? styles.segBtnActive : ""}`}
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
                className={`${styles.currencyBtn} ${currency === k ? styles.currencyBtnActive : ""}`}
              >
                {k === "USD" ? "$" : "원"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 리스트 */}
      <ul className={styles.list}>
        {sorted.map((h) => {
          const series = seriesMap.get(h.code) || [];
          const price = Number(series.at(-1)?.price ?? ticks[h.code]?.price ?? h.prev_close ?? h.avg ?? 0);
          const rate = (() => {
            const base = Number.isFinite(ticks[h.code]?.prevClose)
              ? ticks[h.code].prevClose
              : typeof h?.prev_close === "number"
              ? h.prev_close
              : Number(h?.avg) || null;
            return price && base ? ((price - base) / base) * 100 : 0;
          })();
          const value = price * Number(h.qty || 0);
          const display = metric === "price" ? price : value;

          return (
            <li key={h.code} className={styles.Row}>
              <div className={styles.left}>
                {metric === "price" ? (
                  <Spark id={h.code} data={series} up={rate >= 0} />
                ) : (
                  logoFor(h.code) && <img className={styles.chartIcon} src={logoFor(h.code)} alt="" />
                )}
                <div>
                  <div className={styles.itemTitle}>{h.name || h.code}</div>
                </div>
              </div>

              <div className={styles.right}>
                <div className={styles.value}>{money(display)}</div>
                <div className={`${styles.change} ${rate >= 0 ? styles.changeUp : styles.changeDown}`}>
                  {rate >= 0 ? "+" : ""}
                  {rate.toFixed(1)}%
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.line} />

      {/* 하단 버튼 */}
      <div className={styles.btncontainer}>
        <ul className={styles.btntable}>
          <Link to="/">
            <li className={styles.btn}>
              <span>주문내역</span>
              <div className={styles.rightarea}>
                <span>이번달 {0} 건</span>
                <img src={right} alt="" />
              </div>
            </li>
          </Link>

          <Link to="/">
            <li className={styles.btn}>
              <span>판매수익</span>
              <div className={styles.rightarea}>
                <span></span>
                <img src={right} alt="" />
              </div>
            </li>
          </Link>

          <Link to="/">
            <li className={styles.btn}>
              <span>배당금</span>
              <div className={styles.rightarea}>
                <span>이번달 {monthlyDiv.toLocaleString()}원</span>
                <img src={right} alt="" />
              </div>
            </li>
          </Link>

          <Link to="/" className={styles.btn4}>
            <li>
              <span>수익분석</span>
              <img src={right} alt="" />
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
}
