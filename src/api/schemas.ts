import { z } from 'zod';

/** metals.dev `/latest` — returns metal prices directly in the requested currency/unit. */
export const LatestResponse = z.object({
  status: z.literal('success'),
  currency: z.string(),
  unit: z.string(),
  metals: z.record(z.string(), z.number()),
  currencies: z.record(z.string(), z.number()).optional(),
  timestamps: z.object({
    metal: z.string(),
    currency: z.string().optional(),
  }),
});
export type LatestResponse = z.infer<typeof LatestResponse>;

/** metals.dev `/timeseries` — always in USD / toz, carries a per-date currencies map. */
export const TimeseriesResponse = z.object({
  status: z.literal('success'),
  start_date: z.string(),
  end_date: z.string(),
  unit: z.string().optional(),
  rates: z.record(
    z.string(),
    z.object({
      metals: z.record(z.string(), z.number()),
      currencies: z.record(z.string(), z.number()).optional(),
    }),
  ),
});
export type TimeseriesResponse = z.infer<typeof TimeseriesResponse>;

export const ApiErrorResponse = z.object({
  status: z.literal('failure').optional(),
  error_code: z.union([z.number(), z.string()]).optional(),
  error_message: z.string().optional(),
  message: z.string().optional(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponse>;
