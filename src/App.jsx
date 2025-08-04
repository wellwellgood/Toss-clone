import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import SendMoney from './pages/SendMoney';
import Transaction from './pages/Transaction';
import Loading from './pages/loading';

function LoadingRedirect() {
  
  const navigate = useNavigate();

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem('appLoaded') === 'true';

    if (alreadyLoaded) {
      navigate('/home'); // 이미 로딩됐으면 바로 리디렉션
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem('appLoaded', 'true');
        navigate('/home');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const alreadyLoaded = sessionStorage.getItem('appLoaded') === 'true';
  return alreadyLoaded ? null : <Loading />;
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
