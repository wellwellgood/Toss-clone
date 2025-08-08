import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Home from "../pages/Home/Home";
import Benefit from "../pages/benefit/benefit";
import Loading from "../pages/loading";

function LoadingRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem('appLoaded') === 'true';
    if (alreadyLoaded) {
      navigate('/Home');
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem('appLoaded', 'true');
        navigate('/Home');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);
  return sessionStorage.getItem('appLoaded') === 'true' ? null : <Loading />;
}

export default function AnimatedRoutes() {
  const location = useLocation();
  const [prevIndex, setPrevIndex] = useState(0);
  const tabs = ["/Home", "/benefit"];
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

  const appLoaded = sessionStorage.getItem('appLoaded') === 'true';

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
          <Route
            path="/"
            element={appLoaded ? <Navigate to="/Home" replace /> : <Navigate to="/loading" replace />}
          />
          <Route path="/loading" element={<LoadingRedirect />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/benefit" element={<Benefit />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
