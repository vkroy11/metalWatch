import { METAL_API_KEYS, METAL_NAMES, SYMBOLS, type MetalQuote, type Purity, type Symbol } from '../types/metals';
import type { LatestResponse } from '../api/schemas';
import { rateToPurityAdjustedGram } from './convert';

export type PrevSnapshot = Partial<Record<Symbol, { rate: number; capturedAt: number }>>;

function inrPerOunce(raw: LatestResponse, symbol: Symbol): number | null {
  const key = METAL_API_KEYS[symbol];
  const value = raw.metals[key];
  if (typeof value === 'number' && value > 0) return value;
  return null;
}

function computeDelta(
  current: number,
  prev: { rate: number; capturedAt: number } | undefined,
): MetalQuote['delta24h'] {
  if (!prev || prev.rate === 0) return null;
  const ageMs = Date.now() - prev.capturedAt;
  if (ageMs < 12 * 60 * 60 * 1000) return null;
  const abs = current - prev.rate;
  const pct = (abs / prev.rate) * 100;
  return { abs, pct };
}

function parseTimestamp(ts: string): number {
  const ms = Date.parse(ts);
  return Number.isFinite(ms) ? ms : Date.now();
}

export function adaptLatest(
  raw: LatestResponse,
  purity: Purity,
  prev?: PrevSnapshot,
): MetalQuote[] {
  const updatedAt = parseTimestamp(raw.timestamps.metal);
  const quotes: MetalQuote[] = [];
  for (const symbol of SYMBOLS) {
    const ipo = inrPerOunce(raw, symbol);
    if (ipo === null) continue;
    // Karat purity is a gold-specific convention. Silver, platinum, and
    // palladium are always quoted as pure (equivalent to 24K identity).
    const effectivePurity: Purity = symbol === 'XAU' ? purity : '24K';
    const price = rateToPurityAdjustedGram(ipo, effectivePurity);
    const prevGram = prev?.[symbol]
      ? { rate: rateToPurityAdjustedGram(prev[symbol]!.rate, effectivePurity), capturedAt: prev[symbol]!.capturedAt }
      : undefined;
    quotes.push({
      symbol,
      name: METAL_NAMES[symbol],
      price,
      purity: effectivePurity,
      delta24h: computeDelta(price, prevGram),
      updatedAt,
    });
  }
  return quotes;
}

export function extractRawRates(raw: LatestResponse): PrevSnapshot {
  const out: PrevSnapshot = {};
  const capturedAt = parseTimestamp(raw.timestamps.metal);
  for (const symbol of SYMBOLS) {
    const ipo = inrPerOunce(raw, symbol);
    if (ipo !== null) out[symbol] = { rate: ipo, capturedAt };
  }
  return out;
}
