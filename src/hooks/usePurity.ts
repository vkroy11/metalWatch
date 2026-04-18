import { usePurityStore } from '../state/purityStore';

export const usePurity = () => usePurityStore((s) => s.purity);
export const useSetPurity = () => usePurityStore((s) => s.setPurity);
