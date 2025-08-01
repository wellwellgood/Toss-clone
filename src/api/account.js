export async function getAccount() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          owner: "홍길동",
          balance: 120000,
        });
      }, 1000); // API 응답 시뮬레이션
    });
  }