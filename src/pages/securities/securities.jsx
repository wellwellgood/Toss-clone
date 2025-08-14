import { useEffect, useState, useRef } from "react";
import styles from "../../css/securities/securities.module.css";

/** KIS 국내지수 실시간 메시지(문자열)에서 코드/지수/등락률 추출 (휴리스틱) */
function parseKisIndexPayload(raw) {
  // 예: "0|H0XXXXXX|1|...^0001^...^814.10^...^-0.80^..." 형식(필드 순서/위치는 계정/문서버전에 따라 다를 수 있음)
  const codeMatch = raw.match(/(?:\^|)(0001|1001|2001|4001)(?:\^|)/); // KOSPI/KOSDAQ/KOSPI200/KRX100
  const code = codeMatch ? codeMatch[1] : null;

  // 숫자 토큰만 추려서 가격/등락률 후보 찾기
  const parts = raw.split("^").map(s => s.replace(/,/g, "").trim());
  const nums = parts
    .filter(s => /^-?\d+(\.\d+)?$/.test(s))
    .map(Number);

  // 가격 후보: 소수점 있는 큰 값 쪽을 우선
  let price = null;
  const priceCandidates = nums.filter(n => n > 0.01);
  if (priceCandidates.length) {
    // 가장 "마지막에 등장한" 양수로 잡아줌 (대부분 현재가가 뒤쪽에 옴)
    price = priceCandidates[priceCandidates.length - 1];
  }

  // 등락률 후보: 절대값 30% 이하의 마지막 값(대부분 뒤쪽에 위치)
  let rate = null;
  const rateCandidates = nums.filter(n => Math.abs(n) <= 30);
  if (rateCandidates.length) {
    rate = rateCandidates[rateCandidates.length - 1];
  }

  return { code, price, rate };
}

export default function Securities() {
  const [logs, setLogs] = useState([]);
  const [kosdaq, setKosdaq] = useState({ price: null, rate: null }); // 1001
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("wss://toss-clone.onrender.com"); // 서버 포트는 .env의 PORT와 일치
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        // 1) 헤더용: KIS 국내지수 실시간
        if (msg?.provider === "KIS-WS" && typeof msg?.raw === "string") {
          const { code, price, rate } = parseKisIndexPayload(msg.raw || msg.payload || "");
          if (code === "1001") {
            setKosdaq((prev) => ({
              price: (price ?? prev.price),
              rate: (rate ?? prev.rate),
            }));
          }
        }

        // 2) 디버그용 로그는 유지
        setLogs((prev) => [msg, ...prev].slice(0, 80));
      } catch {
        /* ignore */
      }
    };

    return () => ws.close();
  }, []);

  // 표시용 포맷터
  const fmt = (n, digits = 2) =>
    n === null || n === undefined ? "—" : Number(n).toFixed(digits);

  const isUp = typeof kosdaq.rate === "number" ? kosdaq.rate > 0 : null;

  return (
    <div className={styles.container}>
      {/* ───────────────── 헤더 (토스 느낌) ───────────────── */}
      <div className={styles.headline}>
        <span className={styles.brand}>토스증권</span>
        <span className={styles.indexName}>코스닥</span>
        <span className={`${styles.indexValue} ${isUp === null ? "" : (isUp ? styles.up : styles.down)}`}>
          {fmt(kosdaq.price, 2)}
        </span>
        <span className={`${styles.indexRate} ${isUp === null ? "" : (isUp ? styles.up : styles.down)}`}>
          {isUp ? "+" : ""}{fmt(kosdaq.rate, 1)}%
        </span>
      </div>

      {/* ───────────────── 아래는 기존 로그 뷰 유지 ───────────────── */}
      <pre
        className={styles.log}
      >
        {logs.map((x) => JSON.stringify(x)).join("\n")}
      </pre>
    </div>
  );
}
