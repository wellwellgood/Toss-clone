import ProductCard from "./ProductCard";

export default function ProductGrid({ items, loading, error }) {
  if (loading) {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
        // gridtemplatecolumns: "epeat(auto-fill, minmax(160px, auto))",
        gap: 12, padding: 12
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: 200, borderRadius: 14,
            background: "linear-gradient(90deg,#f2f3f7 25%,#eceef3 37%,#f2f3f7 63%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.4s ease infinite"
          }}/>
        ))}
        <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:0 0}}`}</style>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 24, color: "#e11d48", textAlign: "center" }}>⚠️ {error}</div>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(160px,auto))",
      gap: 12, padding: 12
    }}>
      {items.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
