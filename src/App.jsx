import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import SendMoney from './pages/SendMoney';
import Transaction from './pages/Transaction';
import Loading from './pages/loading';

function LoadingRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem('appLoaded', 'true');  // ✅ 로딩 완료 플래그 저장
      navigate('/home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return <Loading />;
}

export default function App() {
  const appLoaded = sessionStorage.getItem('appLoaded') === 'true';

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={appLoaded ? <Navigate to="/home" replace /> : <Navigate to="/loading" replace />}
        />
        <Route path="/loading" element={<LoadingRedirect />} />
        <Route path="/home" element={<Home />} />
        <Route path="/send" element={<SendMoney />} />
        <Route path="/transactions" element={<Transaction />} />
      </Routes>
    </BrowserRouter>
  );
}
