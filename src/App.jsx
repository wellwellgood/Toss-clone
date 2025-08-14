import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SendMoney from './pages/SendMoney';
import Transaction from './pages/Transaction';
import Loading from './pages/loading';
import AnimatedRoutes from './Route/AnimatedRoutes';
import AppView from './components/AppView';
import { lazy, Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';
import TabBar from './pages/tabbar.jsx';
import Securities from "./pages/securities/securities";


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
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const Benefit = lazy(() => import('./pages/benefit/benefit.jsx'));
const Shopping = lazy(() => import('./pages/shopping/shopping.jsx'));

export default function App() {
  const appLoaded = sessionStorage.getItem('appLoaded') === 'true';

  return (
    <BrowserRouter>
          <AnimatedRoutes />
          <TabBar />
    </BrowserRouter>
  );
}
