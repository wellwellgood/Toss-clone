const API_BASE = process.env.NODE_ENV === "production"
  ? "https://your-api-server.com"
  : "http://localhost:3000"; // 개발 서버 주소 (백엔드 붙으면 변경)

export async function apiFetch(endpoint, options = {}) {
  if (process.env.NODE_ENV === "development") {
    console.log(`⚠️ [DEV] API 요청 차단 → Mock 데이터 반환 (${endpoint})`);

    // ✅ 엔드포인트별 Mock 데이터
    if (endpoint === "/users") {
      return [{ id: 1, name: "테스트 유저" }, { id: 2, name: "Mock 데이터" }];
    }
    if (endpoint === "/transactions") {
      return [
        { id: "tx1", amount: 1000, status: "success" },
        { id: "tx2", amount: 5000, status: "pending" },
      ];
    }

    return { message: "개발 모드 Mock 데이터" };
  }

  // ✅ 실제 API 호출
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);
  return res.json();
}
