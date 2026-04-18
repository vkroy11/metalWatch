import { latestFixture, makeTimeseriesFixture } from '../../api/fixtures';
import { adaptLatest, extractRawRates } from '../latest';
import { adaptTimeseries } from '../timeseries';

describe('adaptLatest (metals.dev shape)', () => {
  test('returns 4 quotes in canonical order', () => {
    const quotes = adaptLatest(latestFixture, '22K');
    expect(quotes.map(q => q.symbol)).toEqual(['XAU', 'XAG', 'XPT', 'XPD']);
  });

  test('gold 22K is in realistic Indian market range (INR/gram)', () => {
    const gold = adaptLatest(latestFixture, '22K').find(q => q.symbol === 'XAU')!;
    // fixture gold = 447828.91 INR/oz → / 31.1035 ≈ 14399.15 → × 22/24 ≈ 13199.22
    expect(gold.price).toBeGreaterThan(10000);
    expect(gold.price).toBeLessThan(20000);
  });

  test('24K values are strictly greater than 22K for same metal', () => {
    const g24 = adaptLatest(latestFixture, '24K').find(q => q.symbol === 'XAU')!;
    const g22 = adaptLatest(latestFixture, '22K').find(q => q.symbol === 'XAU')!;
    const g18 = adaptLatest(latestFixture, '18K').find(q => q.symbol === 'XAU')!;
    expect(g24.price).toBeGreaterThan(g22.price);
    expect(g22.price).toBeGreaterThan(g18.price);
  });

  test('delta24h is null when no prior snapshot', () => {
    const quotes = adaptLatest(latestFixture, '22K');
    expect(quotes.every(q => q.delta24h === null)).toBe(true);
  });

  test('delta24h fires only when prior snapshot is older than 12h', () => {
    const freshPrev = { XAU: { rate: 440000, capturedAt: Date.now() - 1000 * 60 * 10 } };
    const agedPrev = { XAU: { rate: 440000, capturedAt: Date.now() - 1000 * 60 * 60 * 24 } };
    const fresh = adaptLatest(latestFixture, '22K', freshPrev).find(q => q.symbol === 'XAU')!;
    const aged = adaptLatest(latestFixture, '22K', agedPrev).find(q => q.symbol === 'XAU')!;
    expect(fresh.delta24h).toBeNull();
    expect(aged.delta24h).not.toBeNull();
    expect(aged.delta24h!.abs).toBeGreaterThan(0); // current 447k > prev 440k
  });

  test('extractRawRates captures INR/oz for all four symbols', () => {
    const snap = extractRawRates(latestFixture);
    expect(Object.keys(snap).sort()).toEqual(['XAG', 'XAU', 'XPD', 'XPT']);
    expect(snap.XAU!.rate).toBeCloseTo(latestFixture.metals.gold!, 2);
  });

  test('updatedAt parses the ISO metal timestamp', () => {
    const q = adaptLatest(latestFixture, '22K')[0];
    expect(q.updatedAt).toBe(Date.parse('2026-04-18T20:28:06.076Z'));
  });
});

describe('adaptTimeseries (metals.dev shape)', () => {
  test('converts USD/toz × INR rate into realistic INR/gram values', () => {
    const raw = makeTimeseriesFixture('XAU', 10);
    const points = adaptTimeseries(raw, 'XAU', '22K', '1W');
    expect(points.length).toBeGreaterThan(0);
    for (const p of points) {
      expect(p.v).toBeGreaterThan(10000);
      expect(p.v).toBeLessThan(20000);
    }
  });

  test('respects maxPoints cap for 1Y range (120)', () => {
    const raw = makeTimeseriesFixture('XAU', 365);
    const points = adaptTimeseries(raw, 'XAU', '22K', '1Y');
    expect(points.length).toBeLessThanOrEqual(120);
  });

  test('points are sorted ascending by timestamp', () => {
    const raw = makeTimeseriesFixture('XAG', 30);
    const points = adaptTimeseries(raw, 'XAG', '22K', '1M');
    for (let i = 1; i < points.length; i++) {
      expect(points[i].t).toBeGreaterThanOrEqual(points[i - 1].t);
    }
  });
});
