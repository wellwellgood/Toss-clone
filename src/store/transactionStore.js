import { create } from 'zustand';

export const useTransactionStore = create((set) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
}));
