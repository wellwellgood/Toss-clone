import { create } from 'zustand';

export const useAccountStore = create((set) => ({
  balance: 0,
  owner: '김기윤',
  setAccount: (balance, owner) => set({ balance, owner }),
}));
