// routes/AnimatedRoutes.jsx
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";


//import components

// 탭 배열 순서대로
const tabs = ["/Home", "/benefit",/* "/shopping", "/securities", "/all"*/];

import Home from "../pages/Home/Home";
import Benefit from "../pages/benefit/benefit";
// import Shopping from "../pages/shopping/shopping";
// import Securities from "../pages/Securities/Securities";
// import All from "../pages/All/All";

export default function AnimatedRoutes() {
  const location = useLocation();
  const [prevIndex, setPrevIndex] = useState(0); // starting Home
  const currentIndex = tabs.indexOf(location.pathname);
  const direction = currentIndex > prevIndex ? 1 : -1;

  useEffect(() => {
    setPrevIndex(currentIndex);
  }, [location.pathname]);

  const variants = {
    initial: { x: direction * 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction * -100, opacity: 0 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.1 }}
      >
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/benefit" element={<Benefit />} />
          {/* <Route path="/shopping" element={<Shopping />} /> */}
          {/* <Route path="/securities" element={<Securities />} /> */}
          {/* <Route path="/all" element={<All />} /> */}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
