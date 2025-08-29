import { useEffect, useState } from "react";

// 쇼핑홈/특가/식품/... 기존 라벨 → FakeStore 카테고리 매핑
const CATEGORY_MAP = {
  "쇼핑홈": "all",
  "특가": "all",
  "식품": "all",
  "생활용품": "all",
  "뷰티": "jewelery",          // 근접 매핑
  "패션": "men's clothing",     // 임시 매핑
  "주방용품": "all",
  "전자제품": "electronics",
  "반려동물": "all",
  "자동차용품": "all",
  "취미": "all",
};

export function useProductsByLabel(label, limit = 12) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const cat = CATEGORY_MAP[label] || "all";
        const base = "https://fakestoreapi.com";
        const url =
          cat === "all"
            ? `${base}/products?limit=${limit}`
            : `${base}/products/category/${encodeURIComponent(cat)}?limit=${limit}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error("상품 불러오기 실패");
        const data = await r.json();
        if (alive) setItems(data);
      } catch (e) {
        if (alive) setErr(e.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [label, limit]);

  return { items, loading, error: err };
}
