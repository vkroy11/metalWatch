import { create } from 'zustand';
import type { Purity } from '../types/metals';

type PurityState = {
  purity: Purity;
  setPurity: (p: Purity) => void;
};

export const usePurityStore = create<PurityState>((set) => ({
  purity: '22K',
  setPurity: (purity) => set({ purity }),
}));
