import { METAL_API_KEYS, type ChartPoint, type Purity, type Range, type Symbol } from '../types/metals';
import type { TimeseriesResponse } from '../api/schemas';
import { rateToPurityAdjustedGram } from './convert';
import { MAX_POINTS, downsample } from '../utils/downsample';

function parseDate(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getTime();
}

/** metals.dev /timeseries always returns USD/toz. We convert per-day to INR
 *  using `currencies.INR` (which is USD per 1 INR), then to INR/gram at purity. */
export function adaptTimeseries(
  raw: TimeseriesResponse,
  symbol: Symbol,
  purity: Purity,
  range: Range,
): ChartPoint[] {
  const metalKey = METAL_API_KEYS[symbol];
  // Karat purity is a gold-specific convention; other metals bypass it.
  const effectivePurity: Purity = symbol === 'XAU' ? purity : '24K';
  const dateKeys = Object.keys(raw.rates).sort();
  const points: ChartPoint[] = [];
  for (const key of dateKeys) {
    const day = raw.rates[key];
    const usdPerToz = day.metals[metalKey];
    if (typeof usdPerToz !== 'number' || usdPerToz <= 0) continue;

    const usdPerInr = day.currencies?.INR;
    if (typeof usdPerInr !== 'number' || usdPerInr <= 0) continue;

    const inrPerToz = usdPerToz / usdPerInr;
    points.push({ t: parseDate(key), v: rateToPurityAdjustedGram(inrPerToz, effectivePurity) });
  }
  return downsample(points, MAX_POINTS[range]);
}
