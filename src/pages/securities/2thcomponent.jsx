import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/securities/2thcomponent.module.css";
import useKRW from "../../hooks/securitiesPoFol";
import useLiveTicks from "../../hooks/useLiveTicks";
import useLiveSeriesMap from "../../hooks/useLiveSeriesMap";
import { AreaChart, Area } from "recharts";

//import image
import right from "./img/right.jpg";
import apple from "./img/1.png";
import tesla from "./img/2.png";
import pstv from "./img/3.png";

function Spark({ id, data = [], up }) {
  const gid = `grad-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const safe = data?.length
    ? data
    : [
        { t: 0, price: 0 },
        { t: 1, price: 0 },
      ];
  const stroke = up ? "#ef4444" : "#2563eb";

  return (
    <AreaChart width={120} height={36} data={safe}>
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

export default function TwoThComponent({ holdings }) {
  const logoMap = { AAPL: apple, TSLA: tesla, PSTV: pstv };
  const logoFor = (code) => logoMap[String(code || "").toUpperCase()] || "";
  const krw = useKRW({ suffix: "원", showSign: true, digits: 0 });

  function pickLogo(symbol) {
    const up = String(symbol || "").toUpperCase();
    const key = `./img/logo-${up}.png`;
    const mod = logoMods[key];
    return (
      (mod && "default" in mod ? mod.default : logoMap[up]) ||
      logoMods["./img/logo-default.png"]?.default ||
      ""
    );
  }

  function renderLogo(symbol) {
    const src = pickLogo(symbol);
    return src ? <img className={styles.logo} src={src} alt="" /> : null;
  }

  const H = holdings ?? [];
  const HH =
    H && H.length
      ? H
      : [
          {
            code: "AAPL",
            name: "애플",
            qty: 0.016873,
            avg: 314462,
            prev_close: 350737,
          },
          {
            code: "TSLA",
            name: "테슬라",
            qty: 0.000163,
            avg: 446706,
            prev_close: 668711,
          },
          {
            code: "PSTV",
            name: "플러스 테라퓨틱스",
            qty: 12,
            avg: 675,
            prev_close: 781,
          },
        ];

  const codes = useMemo(
    () => [...new Set(HH.map((x) => x.code).filter(Boolean))],
    [HH]
  );
  const T = useLiveTicks(import.meta.env.VITE_WS_URL, { codes, minGapMs: 0 });
  const seriesMap = useLiveSeriesMap(T, codes, { max: 600, stepMs: 0 });

  const fmtTS = (ts) =>
    ts
      ? new Date(Number(ts)).toLocaleTimeString("ko-KR", { hour12: false })
      : "-";

  let cost = 0,
    mv = 0;
  for (const h of HH) {
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
  const logoMods = import.meta.glob("./img/logo-*.png", { eager: true });

  const toCur = (v) => (currency === "USD" ? v / usdRate : v);
  const money = (v) =>
    currency === "USD"
      ? `$ ${Math.round(toCur(v)).toLocaleString()}`
      : `${krw.raw(v)}원`;

  const changeRate = (tick, h) => {
    const p = Number(tick?.price ?? h?.prev_close ?? h?.avg ?? 0);
    const base = Number.isFinite(tick?.prevClose)
      ? tick.prevClose
      : typeof h?.prev_close === "number"
      ? h.prev_close
      : Number(h?.avg) || null;
    return p && base ? ((p - base) / base) * 100 : 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.mystock}>
          <div className={styles.stock}>
            <span>내 종목보기</span>
            <img src={right} alt="" />
          </div>
        </Link>
        <div className={styles.pricestock}>
          <div className={styles.totalValue}>{money(mv)}</div>
          <div
            className={`${styles.pnl} ${
              pnlAbs >= 0 ? styles.pnlUp : styles.pnlDown
            }`}
          >
            {pnlAbs >= 0 ? "" : "-"}
            {money(Math.abs(pnlAbs))} ({pnlRate.toFixed(1)}%)
          </div>
        </div>
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
      <ul className={styles.list}></ul>
      {HH.map((h) => {
        const series = seriesMap.get(h.code) || [];
        const last = series.length ? series[series.length - 1] : null;
        const price = Number(
          series.at(-1)?.price ?? T[h.code]?.price ?? h.prev_close ?? h.avg ?? 0
        );
        const ts = Number(series.at(-1)?.t ?? T[h.code]?.ts ?? 0);
        const rate = changeRate({ price, prevClose: T[h.code]?.prevClose }, h);
        const value = price * Number(h.qty || 0);
        const display = metric === "price" ? price : value;
        const chg = rate;

        return (
            <li key={h.code} className={styles.Row}>
              <div className={styles.left}>
                {metric === "price" ? (
                  <Spark id={h.code} data={series} up={chg >= 0} />
                ) : (
                  logoFor(h.code) && (
                    <img
                      className={styles.chartIcon}
                      src={logoFor(h.code)}
                      alt=""
                    />
                  )
                )}
                <div>
                  <div className={styles.itemTitle}>
                    {/* {renderLogo(h.code)} */}
                    {h.name || h.code}
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
      <div className={styles.line}></div>
      <div className={styles.btncontainer}>
        <ul className={styles.btntable}>
          <Link to="/">
            <li className={styles.btn}>
              <span>주문내역</span>
              <div className={styles.rightarea}>
                <span>이번달{}건</span>
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
                <span>이번달{}원</span>
                <img src={right} alt="" />
              </div>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
}
