# Toss Interaction Clone

토스 앱의 텍스트 인터랙션(순차 등장 애니메이션, 대각선 마스크 리빌, 배경 루프)을 React + CSS Modules로 구현한 프로젝트입니다.  
**부모는 무한 루프, 자식 텍스트는 순차적으로 1회씩 애니메이션**되는 구조를 그대로 재현합니다.

---

## 📸 Preview
(스크린샷 / GIF 첨부)

---

## 🚀 Features
- **TextMotion 컴포넌트**
  - `unit="char" | "word" | "line"` 옵션으로 토큰 단위 지정
  - `delayStep`, `delayBase`로 순차 등장 시간 제어
  - `duration`으로 전체 애니메이션 총 길이 제어
  - CSS 변수(`--d`, `--dur`, `--x`, `--y`, `--gap`) 기반 딜레이/시간 계산

- **Animation Presets**
  - `fade`: 기본 페이드 인
  - `slide`: Y축 이동 + 페이드 인
  - `fadeSlide`: X축 이동 + 페이드 인
  - `fadeDiagSlide`: 대각선 이동 + 페이드 인
  - `diagMask`: 마스크를 활용한 대각선 방향 리빌 효과

- **Loop System**
  - 부모 컨테이너(`.bgLoop`)는 `::before` 가상 요소에 무한 루프 애니메이션만 적용
  - 자식은 `cycle` state와 `key={cycle}` 트릭으로 매 사이클마다 재마운트 → 자식 애니메이션은 매번 1회 실행

---

## 🛠 Tech Stack
- **React 18**
- **Vite**
- **CSS Modules**
- **Framer Motion** (optional, 현재 버전은 pure CSS 기반)

---

## 📂 Structure
