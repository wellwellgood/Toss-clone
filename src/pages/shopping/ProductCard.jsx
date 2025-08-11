export default function ProductCard({ product }) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #f0f1f4",
        borderRadius: 14,
        padding: 10,
        boxShadow: "0 1px 8px rgba(0,0,0,.04)"
      }}>
        <div style={{
          height: 140, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        </div>
        <div
          title={product.title}
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {product.title}
        </div>
        <div style={{ marginTop: 6, fontWeight: 700, fontSize: 14 }}>
          {Number(product.price).toLocaleString("ko-KR")}원
        </div>
      </div>
    );
  }
  