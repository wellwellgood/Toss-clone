# Toss Clone Project
## 해당 ux/ui는 2025/07/31 기준으로 제작되었습니다.


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
## Features

| 영역 | 내용 | 상태 |
|---|---|---|
| 네비게이션 | 하단 탭, 뒤로가기 상태 복원 | ✅ |
| 송금 | 금액 입력, 애니메이션 | ✅ |
| 거래내역 | Mock + REST API, Skeleton 로딩 | ✅ |
| 증권 | WS 실시간 시세, 스파크라인 | ✅ |
| 파일 | Firebase Storage 업로드, R2 다운로드 | ✅ |
| 접근성 | ARIA·키보드 포커스 | ⏳ |
| 테스트 | Vitest/RTL, MSW | ⏳ |

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

## Architecture

- **Front**: React 18, Router, Zustand, Framer Motion, Vite  
- **Back**: Node/Express, `ws` , render 
- **Flow**: REST(거래/파일 메타) + WS(`/ws`) → Zustand → 미니 차트 렌더

## 📡 API 연동

### KIS (한국투자증권 API)

- **사용 목적**: 실시간 주가 조회, 종목 정보 가져오기
- **환경 변수 (.env)**

## ♣ 참고사항

#### 1. 홈 페이지의 결제금액은 MOCK데이터를 사용하였 나타냈습니다.
#### 2. 증권 페이지의 주가 정보 및 포트폴리오는 KIS의 API를 사용하여 실시간 데이터 및 종목정보를 가져와 사용하였습니다.또한 가독성 및 API의 원활한 사용 및 통신을 위하여 chatGPT의 도움을 받아 제작하였습니다.
#### 3. 각 css들은 각각 수정에 용이하기 위해 중복되는 요소들이 많음을 알려드립니다.