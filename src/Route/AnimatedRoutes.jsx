// Route/AnimatedRoutes.jsx — 최종본 (현재 화면 기준 좌/우 분리)
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import Home from "../pages/Home/Home";
import Benefit from "../pages/benefit/benefit";
import Loading from "../pages/loading";
import Shopping from "../pages/shopping/shopping";
import Securities from "../pages/securities/securities";
import Allmenu from "../pages/allmenu/allmenu"

function LoadingRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem("appLoaded") === "true";
    if (alreadyLoaded) {
      navigate("/Home", { replace: true });
    } else {
      const t = setTimeout(() => {
        sessionStorage.setItem("appLoaded", "true");
        navigate("/Home", { replace: true });
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [navigate]);
  return sessionStorage.getItem("appLoaded") === "true" ? null : <Loading />;
}

export default function AnimatedRoutes() {
  const location = useLocation();

  // 왼쪽 → 오른쪽 순서대로! (여기 순서가 '좌/우' 기준)
  const ORDER = useMemo(() => ["/home", "/benefit"], []);

  // 경로 소문자 통일 (대소문자 섞여도 안전)
  const path = location.pathname.toLowerCase();

  // 현재 페이지 인덱스
  const currentIndex = ORDER.indexOf(path);

  // 이전 인덱스를 state 대신 ref로 저장 → re-render 타이밍 꼬임 방지
  const prevIndexRef = useRef(currentIndex === -1 ? 0 : currentIndex);

  // 방향 계산: 오른쪽 페이지로 이동 = +1, 왼쪽 페이지로 이동 = -1
  // 미지정 경로(-1)는 이전 인덱스를 기준으로 판단(기본 +1)
  const prevIndex = prevIndexRef.current;
  const dir =
    currentIndex === -1 || prevIndex === -1
      ? 1
      : currentIndex > prevIndex
      ? 1
      : currentIndex < prevIndex
      ? -1
      : 0;

  // 렌더 이후 prev 인덱스 갱신
  useEffect(() => {
    if (currentIndex !== -1) {
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  // stale direction 막으려고 variants에 함수 + custom 사용
  const variants = {
    initial: (d) => ({ x: d * 100, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d * -100, opacity: 0 }),
  };

  const appLoaded = sessionStorage.getItem("appLoaded") === "true";

  return (
    // 첫 마운트 튐 방지
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        custom={dir}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.1 }}
      >
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              appLoaded ? (
                <Navigate to="/Home" replace />
              ) : (
                <Navigate to="/loading" replace />
              )
            }
          />
          <Route path="/loading" element={<LoadingRedirect />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/benefit" element={<Benefit />} />
          <Route path="/Shopping" element={<Shopping />} />
          <Route path="/Securities" element={<Securities />} />
          <Route path="/allmenu" element={<Allmenu/>}/>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
