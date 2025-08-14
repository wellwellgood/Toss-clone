# Toss Clone Project

토스(Toss) 앱의 주요 UI/UX와 기능을 React 기반으로 구현한 클론 프로젝트입니다.  
실제 금융 API(KIS) 및 WebSocket을 이용하여 **실시간 주가 조회**, **계좌 내역**, **송금 기능** 등을 구현했습니다.

(UX/UI는 25.07.31 프로젝트 시작일 기준입니다!!)

---

## 📌 프로젝트 개요

- **목표**: Toss의 주요 기능(메인 홈, 송금, 거래내역, 증권 탭)을 재현하고, 실시간 데이터 연동 및 UI 애니메이션 최적화
- **주요 기능**
  - 메인 홈 화면 및 하단 탭바 네비게이션
  - 송금 화면 UI 및 금액 입력 애니메이션
  - 거래 내역 페이지 (mock 데이터 및 API 데이터 지원)
  - 증권 탭 (실시간 주가 조회, WebSocket 기반)
  - Firebase Storage 기반 파일 업로드
  - Cloudflare R2 연동 파일 다운로드
  - 로딩 화면 → 페이지 전환 스켈레톤 UI
  - 뒤로가기 시 마지막 탭 상태 복원

---

## 🛠 기술 스택

### Frontend
- **React** 18
- **React Router DOM** (페이지 네비게이션)
- **Zustand** (전역 상태 관리)
- **Tailwind CSS** (UI 스타일링)
- **Framer Motion** (애니메이션)
- **react-loading-skeleton** (스켈레톤 UI)

### Backend
- **Node.js / Express**
- **PostgreSQL (Neon)** - 거래 내역, 사용자 정보 저장
- **Firebase Admin SDK** - 서버 인증 및 파일 메타데이터 관리
- **Cloudflare R2** - 파일 저장소
- **WebSocket (ws)** - 실시간 주가 데이터 수신
- **dotenv** - 환경 변수 관리

---

## 📡 API 연동 ###(chat GPT의 도움을 받음)

### KIS (한국투자증권 API)
- **사용 목적**: 실시간 주가 조회, 종목 정보 가져오기
- **필요 ENV**
  ```env
  APP_KEY=발급받은_API_KEY
  APP_SECRET=발급받은_SECRET
  KIS_TR_ID_INDEX=H0UPCNT0  # API별 식별자
  KIS_REST=https://openapi.koreainvestment.com:9443
  KIS_WS=ws://ops.koreainvestment.com:21000




# 1. 레포 클론
git clone https://github.com/your-repo/toss-clone.git
cd toss-clone

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에 KIS, Firebase, DB 정보 입력

# 4. 개발 서버 실행
npm run dev

# 5. 백엔드 서버 실행
cd server
node stocke.server.cjs