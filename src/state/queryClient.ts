import { QueryClient } from '@tanstack/react-query';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: SIX_HOURS,
      refetchInterval: SIX_HOURS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      gcTime: ONE_DAY,
    },
  },
});
