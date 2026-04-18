import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeseries } from '../api/metals';
import { adaptTimeseries } from '../adapters/timeseries';
import type { TimeseriesResponse } from '../api/schemas';
import type { ChartPoint, Range, Symbol } from '../types/metals';
import { usePurity } from './usePurity';

// The /timeseries response contains all four metals. Keying the React Query
// cache by range (not by symbol) lets multiple symbol detail screens share one
// payload and avoids duplicate network calls when the user navigates between
// metals within the same range.
export function useTimeSeriesQuery(symbol: Symbol, range: Range) {
  const purity = usePurity();

  const query = useQuery<TimeseriesResponse>({
    queryKey: ['timeseries', range],
    queryFn: () => fetchTimeseries(range),
    enabled: Boolean(symbol),
  });

  const points = useMemo<ChartPoint[] | undefined>(() => {
    if (!query.data) return undefined;
    return adaptTimeseries(query.data, symbol, purity, range);
  }, [query.data, purity, symbol, range]);

  return { ...query, points };
}
