import { useEffect } from 'react';
import { useAccountStore } from '../store/accountStore';
import { getAccount } from '../api/account';

export const useAccount = () => {
  const { setAccount } = useAccountStore();

  useEffect(() => {
    getAccount().then((data) => setAccount(data.balance, data.owner));
  }, []);
};
