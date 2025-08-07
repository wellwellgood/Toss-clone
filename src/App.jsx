import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SendMoney from './pages/SendMoney';
import Transaction from './pages/Transaction';
import Loading from './pages/loading';
import AnimatedRoutes from './Route/AnimatedRoutes';
import AppView from './components/AppView';
import { lazy, Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';


function LoadingRedirect() {
  
  const navigate = useNavigate();

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem('appLoaded') === 'true';

    if (alreadyLoaded) {
      navigate('/Home'); // 이미 로딩됐으면 바로 리디렉션
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem('appLoaded', 'true');
        navigate('/Home');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const alreadyLoaded = sessionStorage.getItem('appLoaded') === 'true';
  return alreadyLoaded ? null : <Loading />;
}

// Lazy loading components
const Home = lazy(() => import("./pages/Home/Home.jsx"));
const Benefit = lazy(() => import('./pages/benefit/benefit.jsx'));

export default function App() {
  const appLoaded = sessionStorage.getItem('appLoaded') === 'true';

  return (
    <BrowserRouter>
      <Suspense fallback={<Skeleton count={10} height={20} />}>
        <Routes>
          <Route
            path="/"
            element={appLoaded ? <Navigate to="/Home" replace /> : <Navigate to="/loading" replace />}
          />
          <Route path="/loading" element={<LoadingRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/benefit" element={<Benefit />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/transactions" element={<Transaction />} />
        </Routes>
        <AnimatedRoutes />
        <AppView />
      </Suspense>
    </BrowserRouter>
  );
}
