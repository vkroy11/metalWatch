import type { LatestResponse, TimeseriesResponse } from './schemas';
import { METAL_API_KEYS, type Symbol } from '../types/metals';

/** Snapshot of a real metals.dev /latest response with currency=INR, unit=toz. */
export const latestFixture: LatestResponse = {
  status: 'success',
  currency: 'INR',
  unit: 'toz',
  metals: {
    gold: 447828.913,
    silver: 7490.6224,
    platinum: 194791.883,
    palladium: 144475.7468,
  },
  currencies: { USD: 92.73, EUR: 109.16, GBP: 125.44 },
  timestamps: {
    metal: '2026-04-18T20:28:06.076Z',
    currency: '2026-04-18T20:26:17.211Z',
  },
};

/** Synthetic timeseries fixture for offline dev + jest.
 *
 *  Metals.dev /timeseries always responds in USD per troy ounce and includes a
 *  `currencies.INR` value (USD per 1 INR). We mimic that here so adapter tests
 *  exercise the full USD → INR conversion path.
 */
export function makeTimeseriesFixture(symbol: Symbol, days = 30): TimeseriesResponse {
  const metalKey = METAL_API_KEYS[symbol];
  const inrValue = latestFixture.metals[metalKey] ?? 100000;
  const inrPerUsd = 92.73;
  const usdValue = inrValue / inrPerUsd;
  const rates: TimeseriesResponse['rates'] = {};
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    const drift = 1 - i * 0.0015;
    const jitter = 1 + Math.sin(i * 1.3) * 0.004;
    rates[dayKey] = {
      metals: { [metalKey]: usdValue * drift * jitter },
      currencies: { INR: 1 / inrPerUsd, USD: 1 },
    };
  }
  const keys = Object.keys(rates);
  return {
    status: 'success',
    start_date: keys[0],
    end_date: keys[keys.length - 1],
    unit: 'toz',
    rates,
  };
}
