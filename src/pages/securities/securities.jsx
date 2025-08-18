import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../css/securities/securities.module.css";


import Firstcomponent from './1stcomponent';
import Secondcomponent from './2thcomponent';

import magnefier from "./img/magnifier.png";
import hambuger from "./img/hamburger.jpg";

/** ── KIS 원시 프레임 파서 ─────────────────────────────── */
function parseKisIndexPayload(rawLike) {
  let raw = rawLike;
  if (typeof rawLike === "object" && rawLike !== null) {
    raw = rawLike.raw ?? rawLike.payload ?? JSON.stringify(rawLike);
  }
  if (typeof raw !== "string") {
    try { raw = String(raw); } catch { raw = ""; }
  }
  const codeMatch = raw.match(/(?:\^|)(0001|1001|2001|4001)(?:\^|)/);
  const code = codeMatch ? codeMatch[1] : null;

  const parts = raw.split("^").map(s => s.replace(/,/g, "").trim());
  const nums = parts.filter(s => /^-?\d+(\.\d+)?$/.test(s)).map(Number);

  let price = null;
  const priceCandidates = nums.filter(n => n > 0.01);
  if (priceCandidates.length) price = priceCandidates[priceCandidates.length - 1];

  let rate = null;
  const rateCandidates = nums.filter(n => Math.abs(n) <= 30);
  if (rateCandidates.length) rate = rateCandidates[rateCandidates.length - 1];

  return { code, price, rate };
}

/** ── WS 주소 ─────────────────────────────────────────── */
function resolveWSUrl() {
  const envUrl = (import.meta?.env && import.meta.env.VITE_WS_URL) || "";
  if (envUrl) return envUrl;
  const proto = location.protocol === "https:" ? "wss://" : "ws://";
  return proto + location.host;
}

/** ── 보여줄 지수 세트(순서 = 슬라이드 순서) ───────────── */
const INDEX_META = [
  { code: "1001", label: "코스닥" },
  { code: "0001", label: "코스피" },
  { code: "2001", label: "코스피200" },
  { code: "4001", label: "KRX100" },
];

const makeEmpty = () =>
  INDEX_META.reduce((acc, { code, label }) => {
    acc[code] = { label, price: null, rate: null };
    return acc;
  }, {});

export default function Securities() {
  const WS_URL = useMemo(resolveWSUrl, []);
  const [idxData, setIdxData] = useState(makeEmpty());
  const [status, setStatus] = useState("idle"); // idle | live | mock
  const [current, setCurrent] = useState(0);    // 현재 보여줄 1개(한 줄)
  const wsRef = useRef(null);
  const lastLiveAtRef = useRef(0);
  const mockTimerRef = useRef(null);
  const autoTimerRef = useRef(null);

  // ── 숫자 포맷
  const fmt = (n, d = 2) => (n == null || Number.isNaN(+n)) ? "—" : (+n).toFixed(d);

  // ── 로컬 모의(서버가 안 줄 때 3초 후 자동 가동)
  const startLocalMock = () => {
    if (mockTimerRef.current) return;
    setStatus("mock");
    const base = Object.fromEntries(INDEX_META.map(m => [m.code, { p: 900 + Math.random()*200, r: 0 }]));
    mockTimerRef.current = setInterval(() => {
      const updates = {};
      for (const { code } of INDEX_META) {
        const drift = (Math.random() - 0.5) * 2;
        base[code].p = Math.max(100, base[code].p + drift);
        base[code].r = Math.max(-30, Math.min(30, base[code].r + drift*0.02));
        updates[code] = {
          ...idxData[code],
          price: +base[code].p.toFixed(2),
          rate:  +base[code].r.toFixed(2),
        };
      }
      setIdxData(prev => ({ ...prev, ...updates }));
    }, 3000);
  };
  const stopLocalMock = () => {
    if (!mockTimerRef.current) return;
    clearInterval(mockTimerRef.current);
    mockTimerRef.current = null;
  };

  // ── WS 연결
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      let msg = e.data;
      try { msg = JSON.parse(e.data); } catch {}
      const payload = typeof msg === "string" ? msg : (msg.raw ?? msg.payload ?? "");
      const { code, price, rate } = parseKisIndexPayload(payload);

      if (code && idxData[code]) {
        setIdxData(prev => ({
          ...prev,
          [code]: {
            ...prev[code],
            price: price ?? prev[code].price,
            rate:  rate  ?? prev[code].rate
          }
        }));
      }
      lastLiveAtRef.current = Date.now();
      setStatus("live");
      stopLocalMock();
    };

    ws.onclose = () => {};
    ws.onerror = () => {};

    return () => {
      try { ws.close(); } catch {}
      wsRef.current = null;
      stopLocalMock();
    };
  }, [WS_URL]); // eslint-disable-line

  // ── 3초 무소식이면 모의 시작
  useEffect(() => {
    const t = setInterval(() => {
      const silent = Date.now() - (lastLiveAtRef.current || 0);
      if (silent > 3000 && status !== "mock") startLocalMock();
    }, 1000);
    return () => clearInterval(t);
  }, [status]); // eslint-disable-line

  // ── 자동 슬라이드: 1개만, 아래→위로 전환
  useEffect(() => {
    clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % INDEX_META.length);
    }, 2500);
    return () => clearInterval(autoTimerRef.current);
  }, []);

  // ── 현재 보여줄 라인
  const { code, label } = INDEX_META[current];
  const price = idxData[code]?.price;
  const rate  = idxData[code]?.rate;
  const tone =
    typeof rate === "number"
      ? rate > 0 ? styles.up : rate < 0 ? styles.down : styles.neutral
      : styles.neutral;

  return (
    <div className={styles.container}>
      <div className={styles.btn}>
        <button>
          <link
            to=""
            className={styles.search}
          />
          <img src={magnefier} alt="" />
          </button>
          <button>
          <link
            to=""
            className={styles.setting}
          />
          <img src={hambuger} alt="" />
          </button>
      </div>
      <header className={styles.header}>
        <div className={styles.brandContainer}>
            <span className={styles.brand}>토스증권</span>
          <div className={styles.vticker}>
            <div key={`${code}-in-${current}`} className={`${styles.vrow} ${styles.in}`}>
              <span className={`${styles.indexName} ${tone}`}>{label}</span>
              <span className={`${styles.indexValue} ${tone}`}>{fmt(price, 2)}</span>
              <span className={`${styles.indexRate} ${tone}`}>{rate > 0 ? "+" : ""}{fmt(rate, 2)}%</span>
            </div>
          </div>
        </div>
      </header>
      <Firstcomponent />
      <Secondcomponent />
    </div>
  );
}
