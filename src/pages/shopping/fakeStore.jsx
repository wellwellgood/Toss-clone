import { useEffect, useState, useMemo, useRef } from "react";

export default function ProductListWithCategories({
  limit = 12,
  initialCategory = "all", // "all" | 실제 카테고리명
}) {
  const [cats, setCats] = useState(["all"]);
  const [active, setActive] = useState(initialCategory);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 카테고리 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("https://fakestoreapi.com/products/categories");
        const data = (await r.json()) || [];
        if (!alive) return;
        setCats(["all", ...data]); // all + API 카테고리
      } catch {
        // 실패해도 아이템은 all로 보여줄 수 있게 넘어감
      }
    })();
    return () => (alive = false);
  }, []);

  // 선택된 카테고리의 아이템 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const base = "https://fakestoreapi.com";
        const url =
          active === "all"
            ? `${base}/products?limit=${limit}`
            : `${base}/products/category/${encodeURIComponent(active)}?limit=${limit}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error("상품 불러오기 실패");
        const data = await r.json();
        if (!alive) return;
        setItems(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [active, limit]);

  // 카테고리 탭
  const Tabs = useMemo(
    () => (
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#f6f7fb",
          padding: "8px 12px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {cats.map((c) => {
            const isActive = c === active;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                type="button"
                style={{
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  border: 0,
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 14,
                  cursor: "pointer",
                  background: isActive ? "#e9f0ff" : "#fff",
                  color: isActive ? "#1f6fff" : "#555",
                  boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                }}
              >
                {toKoreanLabel(c)}
              </button>
            );
          })}
        </div>
      </div>
    ),
    [cats, active]
  );

  // 본문 그리드
  const Grid = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
        gap: 12,
        padding: 12,
      }}
    >
      {loading &&
        Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 200,
              borderRadius: 14,
              background:
                "linear-gradient(90deg,#f2f3f7 25%,#eceef3 37%,#f2f3f7 63%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.4s ease infinite",
            }}
          />
        ))}

      {!loading && !err &&
        items.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              border: "1px solid #f0f1f4",
              borderRadius: 14,
              padding: 10,
              boxShadow: "0 1px 8px rgba(0,0,0,.04)",
            }}
          >
            <div
              style={{
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={p.image}
                alt={p.title}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              title={p.title}
              style={{
                fontSize: 13,
                lineHeight: 1.3,
                marginTop: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {p.title}
            </div>
            <div style={{ marginTop: 6, fontWeight: 700, fontSize: 14 }}>
              {Number(p.price).toLocaleString("ko-KR")}원
            </div>
          </div>
        ))}

      {!loading && err && (
        <div style={{ gridColumn: "1 / -1", color: "#e11d48", padding: 24, textAlign: "center" }}>
          ⚠️ {err}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#f6f7fb" }}>
      {Tabs}
      {Grid}
      {/* skeleton 애니메이션 키프레임 */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}

// 영어 카테고리명을 한글 라벨로 매핑(필요시 수정)
function toKoreanLabel(cat) {
  switch (cat) {
    case "all": return "전체";
    case "electronics": return "전자제품";
    case "jewelery": return "쥬얼리";
    case "men's clothing": return "남성패션";
    case "women's clothing": return "여성패션";
    default: return cat;
  }
}
