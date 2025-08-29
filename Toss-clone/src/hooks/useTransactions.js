import { useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { getTransactions } from '../api/transaction';

export const useTransactions = () => {
  const { setTransactions } = useTransactionStore();

  useEffect(() => {
    getTransactions().then(setTransactions);
  }, [setTransactions]);
};
