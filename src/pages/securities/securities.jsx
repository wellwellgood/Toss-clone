import { useEffect, useState, useRef, useMemo } from "react";
import styles from "../../css/securities/securities.module.css";

/** ─────────────────────────────────────────────────────────
 *  KIS 지수 페이로드 휴리스틱 파서 (원본 로직 개선)
 *  - 문자열/JSON 모두 허용
 *  - 코스피(0001), 코스닥(1001), 코스피200(2001), KRX100(4001)
 *  - 가격/등락률 후보를 뒤쪽에서 우선 매칭
 *  ───────────────────────────────────────────────────────── */
function parseKisIndexPayload(rawLike) {
  // JSON이면 그대로 사용, 문자열이면 보강
  let raw = rawLike;
  if (typeof rawLike === "object" && rawLike !== null) {
    // { raw: "...^..."} 형태일 때 최대한 원문을 꺼내준다
    raw = rawLike.raw ?? rawLike.payload ?? JSON.stringify(rawLike);
  }
  if (typeof raw !== "string") {
    try { raw = String(raw); } catch { raw = ""; }
  }

  // 코드 매칭: 필드 경계(^)를 고려
  const codeMatch = raw.match(/(?:\^|)(0001|1001|2001|4001)(?:\^|)/); 
  const code = codeMatch ? codeMatch[1] : null;

  // 숫자 토큰 분리
  const parts = raw.split("^").map(s => s.replace(/,/g, "").trim());
  const nums = parts
    .filter(s => /^-?\d+(\.\d+)?$/.test(s))
    .map(Number);

  // 가격 후보: 0.01 초과 양수 중 "뒤쪽" 값
  let price = null;
  const priceCandidates = nums.filter(n => n > 0.01);
  if (priceCandidates.length) price = priceCandidates[priceCandidates.length - 1];

  // 등락률 후보: 절대값 30% 이하 "뒤쪽" 값
  let rate = null;
  const rateCandidates = nums.filter(n => Math.abs(n) <= 30);
  if (rateCandidates.length) rate = rateCandidates[rateCandidates.length - 1];

  return { code, price, rate };
}

/** 환경/호스트에 맞춰 WS URL 자동 계산 */
function resolveWSUrl() {
  // 1) .env 프론트 변수 우선 (예: VITE_WS_URL=wss://your-host) 
  const envUrl = (import.meta?.env && import.meta.env.VITE_WS_URL) || "";
  if (envUrl) return envUrl;

  // 2) 현재 페이지 기준 동호스트
  const proto = location.protocol === "https:" ? "wss://" : "ws://";
  return proto + location.host;
}

export default function Securities() {
  // 실시간 지수 상태 (코스닥 중심)
  const [kosdaq, setKosdaq] = useState({ price: null, rate: null });
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);

  // 관심목록(데모) — 실제로는 서버/로컬스토리지/쿼리로 대체 가능
  const [watch, setWatch] = useState([
    { code: "005930", name: "삼성전자", price: 0, rate: 0 },
    { code: "000660", name: "SK하이닉스", price: 0, rate: 0 },
    { code: "035420", name: "NAVER", price: 0, rate: 0 },
  ]);

  const WS_URL = useMemo(resolveWSUrl, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // 서버가 구독메시지를 요구한다면 이곳에서 전송
      // 예) 지수 스트림: ws.send(JSON.stringify({ type: "subscribe", tr_id: "H0UPCNT0" }));
      // 예) 관심목록: watch.forEach(w => ws.send(JSON.stringify({ type:"subscribeCode", code: w.code })));
    };

    ws.onmessage = (e) => {
      let msg = e.data;
      try { msg = JSON.parse(e.data); } catch { /* raw string */ }

      // KIS 원시 메시지/래핑메시지 모두 커버
      if (typeof msg === "string") {
        const { code, price, rate } = parseKisIndexPayload(msg);
        if (code === "1001") {
          setKosdaq(prev => ({
            price: price ?? prev.price,
            rate: rate ?? prev.rate,
          }));
        }
      } else if (msg?.provider === "KIS-WS") {
        const { code, price, rate } = parseKisIndexPayload(msg.raw || msg.payload || msg);
        if (code === "1001") {
          setKosdaq(prev => ({
            price: price ?? prev.price,
            rate: rate ?? prev.rate,
          }));
        }
        // (선택) 종목 틱 반영 예시: msg.code, msg.price, msg.rate에 맞게 반영
        // if (msg.code && typeof msg.price === "number") {
        //   setWatch((prev) => prev.map(it => it.code === msg.code ? { ...it, price: msg.price, rate: msg.rate ?? it.rate } : it));
        // }
      }

      setLogs(prev => [msg, ...prev].slice(0, 120));
    };

    ws.onerror = () => { /* 브라우저는 error 후 close가 이어짐 */ };
    ws.onclose = () => { /* 자동 재연결은 서버 or 여기서 setTimeout 으로 처리 가능 */ };

    return () => {
      try { ws.close(); } catch {}
      wsRef.current = null;
    };
  }, [WS_URL]);

  // 표시용 포맷터
  const fmt = (n, digits = 2) =>
    n === null || n === undefined || Number.isNaN(Number(n))
      ? "—"
      : Number(n).toFixed(digits);

  const isUp = typeof kosdaq.rate === "number" ? kosdaq.rate > 0 : null;

  return (
    <div className={styles.container}>
      {/* ───────── 헤더 (토스증권 무드) ───────── */}
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <span className={styles.brand}>토스증권</span>
        </div>
        <div className={styles.indexRow}>
          <span className={styles.indexName}>코스닥</span>
          <span className={`${styles.indexValue} ${isUp === null ? "" : (isUp ? styles.up : styles.down)}`}>
            {fmt(kosdaq.price, 2)}
          </span>
          <span className={`${styles.indexRate} ${isUp === null ? "" : (isUp ? styles.up : styles.down)}`}>
            {isUp ? "+" : ""}{fmt(kosdaq.rate, 2)}%
          </span>
        </div>
      </header>
    </div>
  );
}
