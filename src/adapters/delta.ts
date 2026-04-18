import type { ChartPoint, Direction } from '../types/metals';

export function computeRangeDelta(points: ChartPoint[]): { abs: number; pct: number } | null {
  if (points.length < 2) return null;
  const first = points[0].v;
  const last = points[points.length - 1].v;
  if (first === 0) return null;
  const abs = last - first;
  const pct = (abs / first) * 100;
  return { abs, pct };
}

export function directionOf(delta: { abs: number; pct: number } | null): Direction {
  if (!delta) return 'flat';
  if (delta.abs > 0) return 'gain';
  if (delta.abs < 0) return 'loss';
  return 'flat';
}

export function rangeStats(points: ChartPoint[]): { open: number; high: number; low: number } | null {
  if (points.length === 0) return null;
  let high = -Infinity;
  let low = Infinity;
  for (const p of points) {
    if (p.v > high) high = p.v;
    if (p.v < low) low = p.v;
  }
  return { open: points[0].v, high, low };
}
