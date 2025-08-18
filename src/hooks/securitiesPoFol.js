import { useMemo, useCallback } from "react";

/**
 * 사용법:
 * const krw = useKRW({ suffix: "원", showSign: true, digits: 0, compact: false });
 * krw(123456)  -> "+123,456원"
 * krw.raw(123456) -> "123,456"
 */
export default function useKRW(options = {}) {
  const {
    suffix = "원",     // 뒤에 붙일 단위. ""로 끄기 가능
    showSign = false,  // 양수에 + 붙일지
    digits = 0,        // 소수 자릿수 (0=원단위 반올림)
    compact = false,   // 12만 → "12만" 같이 compact 표기
  } = options;

  const fmt = useMemo(() => new Intl.NumberFormat("ko-KR", {
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }), [compact, digits]);

  const format = useCallback((value) => {
    const n = Number(value ?? 0);
    const text = fmt.format(n);
    const sign = showSign && n > 0 ? "+" : "";
    return suffix ? `${sign}${text}${suffix}` : `${sign}${text}`;
  }, [fmt, showSign, suffix]);

  // 숫자만 필요할 때
  const raw = useCallback((value) => fmt.format(Number(value ?? 0)), [fmt]);

  // 바로 호출해서 쓰기 편하게 함수 자체를 리턴
  const krw = useCallback((v) => format(v), [format]);
  krw.raw = raw;   // krw.raw(값) 형태로도 사용 가능

  return krw;
}
