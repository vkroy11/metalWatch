export type Symbol = 'XAU' | 'XAG' | 'XPT' | 'XPD';
export type Purity = '24K' | '22K' | '18K';
export type Range = '1D' | '1W' | '1M' | '1Y';
export type Direction = 'gain' | 'loss' | 'flat';

export const SYMBOLS: readonly Symbol[] = ['XAU', 'XAG', 'XPT', 'XPD'] as const;

export const METAL_NAMES: Record<Symbol, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

/** metals.dev uses lowercase commodity names in its response payloads. */
export const METAL_API_KEYS: Record<Symbol, 'gold' | 'silver' | 'platinum' | 'palladium'> = {
  XAU: 'gold',
  XAG: 'silver',
  XPT: 'platinum',
  XPD: 'palladium',
};

export type MetalQuote = {
  symbol: Symbol;
  name: string;
  price: number;
  purity: Purity;
  delta24h: { abs: number; pct: number } | null;
  updatedAt: number;
};

export type ChartPoint = { t: number; v: number };

export type RangeBounds = { start: Date; end: Date };
