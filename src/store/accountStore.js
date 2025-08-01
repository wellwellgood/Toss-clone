import { create } from 'zustand';

export const useAccountStore = create((set) => ({
  balance: 0,
  owner: '',
  setAccount: (balance, owner) => set({ balance, owner }),
}));
