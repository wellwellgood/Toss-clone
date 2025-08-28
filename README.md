# Toss Clone Project

토스(Toss) 앱의 주요 UI/UX와 기능을 React 기반으로 구현한 클론 프로젝트입니다.  
**⚠️ 본 프로젝트는 학습/연습용으로 제작되었으며 상업적 목적이 없습니다.**

배포 URL: [https://tossclone.netlify.app](https://tossclone.netlify.app)

---

## 📌 프로젝트 개요

- **목표**: Toss의 주요 기능(메인 홈, 송금, 거래내역, 증권 탭)을 재현하고, 실시간 데이터 연동 및 UI 애니메이션 최적화
- **주요 기능**
  - 메인 홈 화면 및 하단 탭바 네비게이션
  - 송금 화면 UI 및 금액 입력 애니메이션
  - 거래 내역 페이지 (Mock 데이터 및 API 데이터 지원)
  - 증권 탭 (실시간 주가 조회, WebSocket 기반)
  - Firebase Storage 기반 파일 업로드
  - Cloudflare R2 연동 파일 다운로드
  - 로딩 화면 → 페이지 전환 스켈레톤 UI
  - 뒤로가기 시 마지막 탭 상태 복원

---

## 🛠 기술 스택

### Frontend

- **React 18** – UI 컴포넌트 구조
- **React Router DOM** – 페이지 네비게이션
- **Zustand** – 전역 상태 관리 (탭 상태/사용자 데이터)
- **Tailwind CSS** – 유틸리티 기반 스타일링
- **Framer Motion** – 애니메이션 및 전환 효과
- **react-loading-skeleton** – 로딩 스켈레톤 UI

### Backend

- **Node.js / Express** – API 서버
- **PostgreSQL (Neon)** – 거래 내역 및 사용자 정보 저장
- **Firebase Admin SDK** – 서버 인증 및 파일 메타데이터 관리
- **Cloudflare R2** – 파일 저장소
- **WebSocket (ws)** – 실시간 주가 데이터 수신
- **dotenv** – 환경 변수 관리

---

## 📡 API 연동

### KIS (한국투자증권 API)

- **사용 목적**: 실시간 주가 조회, 종목 정보 가져오기
- **환경 변수 (.env) 예시**

```env
APP_KEY=발급받은_API_KEY
APP_SECRET=발급받은_SECRET
KIS_TR_ID_INDEX=H0UPCNT0  # API별 식별자
KIS_REST=https://openapi.koreainvestment.com:9443
KIS_WS=ws://ops.koreainvestment.com:21000
