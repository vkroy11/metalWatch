import type { Purity } from '../types/metals';

export const OUNCE_TO_GRAM = 31.1035;

export const PURITY_FACTOR: Record<Purity, number> = {
  '24K': 1,
  '22K': 22 / 24,
  '18K': 18 / 24,
};

export function ouncesToGrams(inrPerOunce: number): number {
  return inrPerOunce / OUNCE_TO_GRAM;
}

export function applyPurity(inrPerGram: number, purity: Purity): number {
  return inrPerGram * PURITY_FACTOR[purity];
}

export function rateToPurityAdjustedGram(inrPerOunce: number, purity: Purity): number {
  return applyPurity(ouncesToGrams(inrPerOunce), purity);
}
