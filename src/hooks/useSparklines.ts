import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeseries } from '../api/metals';
import { adaptTimeseries } from '../adapters/timeseries';
import type { TimeseriesResponse } from '../api/schemas';
import { SYMBOLS, type ChartPoint, type Direction, type Symbol } from '../types/metals';
import { usePurity } from './usePurity';

export type SparklineEntry = { points: ChartPoint[]; direction: Direction };

/** Fetches 1W timeseries once (shared with Detail screens via the query cache)
 *  and adapts per-symbol points for every tile on the Landing screen. */
export function useSparklines(): {
  data: Partial<Record<Symbol, SparklineEntry>>;
  isLoading: boolean;
} {
  const purity = usePurity();
  const query = useQuery<TimeseriesResponse>({
    queryKey: ['timeseries', '1W'],
    queryFn: () => fetchTimeseries('1W'),
  });

  const data = useMemo<Partial<Record<Symbol, SparklineEntry>>>(() => {
    const out: Partial<Record<Symbol, SparklineEntry>> = {};
    if (!query.data) return out;
    for (const s of SYMBOLS) {
      const points = adaptTimeseries(query.data, s, purity, '1W');
      if (points.length < 2) continue;
      const abs = points[points.length - 1].v - points[0].v;
      const direction: Direction = abs > 0 ? 'gain' : abs < 0 ? 'loss' : 'flat';
      out[s] = { points, direction };
    }
    return out;
  }, [query.data, purity]);

  return { data, isLoading: query.isLoading };
}
