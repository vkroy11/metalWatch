import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatest } from '../api/metals';
import { adaptLatest, extractRawRates } from '../adapters/latest';
import type { LatestResponse } from '../api/schemas';
import type { MetalQuote } from '../types/metals';
import { usePurity } from './usePurity';
import { usePrevSnapshot } from './usePrevSnapshot';

export function usePricesQuery() {
  const purity = usePurity();
  const { prev, saveIfStale } = usePrevSnapshot();

  const query = useQuery<LatestResponse>({
    queryKey: ['latest'],
    queryFn: fetchLatest,
  });

  useEffect(() => {
    if (query.data) void saveIfStale(extractRawRates(query.data));
  }, [query.data, saveIfStale]);

  const quotes = useMemo<MetalQuote[] | undefined>(() => {
    if (!query.data) return undefined;
    return adaptLatest(query.data, purity, prev);
  }, [query.data, purity, prev]);

  return { ...query, quotes };
}
