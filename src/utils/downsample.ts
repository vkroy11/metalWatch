import type { ChartPoint } from '../types/metals';

/**
 * Largest-Triangle-Three-Buckets downsampling. Preserves peaks better than a
 * simple stride reducer, so the chart still reads correctly at low point counts.
 * Falls back to stride when the input is too short for LTTB to be meaningful.
 */
export function downsample(points: ChartPoint[], threshold: number): ChartPoint[] {
  const n = points.length;
  if (threshold >= n || threshold < 3) return points.slice();

  const sampled: ChartPoint[] = [];
  const bucketSize = (n - 2) / (threshold - 2);

  sampled.push(points[0]);
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
    const rangeLen = rangeEnd - rangeStart;
    if (rangeLen <= 0) continue;

    let avgT = 0;
    let avgV = 0;
    for (let j = rangeStart; j < rangeEnd; j++) {
      avgT += points[j].t;
      avgV += points[j].v;
    }
    avgT /= rangeLen;
    avgV /= rangeLen;

    const prevStart = Math.floor(i * bucketSize) + 1;
    const prevEnd = Math.floor((i + 1) * bucketSize) + 1;
    let maxArea = -1;
    let nextA = prevStart;
    const aT = points[a].t;
    const aV = points[a].v;

    for (let j = prevStart; j < prevEnd; j++) {
      const area = Math.abs(
        (aT - avgT) * (points[j].v - aV) - (aT - points[j].t) * (avgV - aV),
      ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }

    sampled.push(points[nextA]);
    a = nextA;
  }

  sampled.push(points[n - 1]);
  return sampled;
}

export const MAX_POINTS: Record<'1D' | '1W' | '1M' | '1Y', number> = {
  '1D': 96,
  '1W': 84,
  '1M': 90,
  '1Y': 120,
};
