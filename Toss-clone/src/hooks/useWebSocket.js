import { useEffect } from 'react';
import { useAccountStore } from '../store/accountStore';

export const useWebSocket = () => {
  const setAccount = useAccountStore((s) => s.setAccount);

  useEffect(() => {
    const timer = setInterval(() => {
      setAccount((prev) => ({
        ...prev,
        balance: prev.balance + Math.floor(Math.random() * 1000 - 500), // 랜덤 잔액 변화
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, [setAccount]);
};
