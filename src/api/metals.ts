import { format, subDays } from 'date-fns';
import { get } from './client';
import { LatestResponse, TimeseriesResponse } from './schemas';
import type { Range } from '../types/metals';

const YMD = 'yyyy-MM-dd';
const MAX_CHUNK_DAYS = 30;
const RANGE_DAYS: Record<Range, number> = { '1D': 1, '1W': 7, '1M': 30, '1Y': 365 };

export async function fetchLatest(): Promise<LatestResponse> {
  const raw = await get('/latest', { currency: 'INR', unit: 'toz' });
  return LatestResponse.parse(raw);
}

function toUTCMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** metals.dev caps each /timeseries call to 30 days and always returns USD/toz.
 * For 1Y we chunk into 30-day windows and fire them in parallel, then merge. */
export async function fetchTimeseries(range: Range): Promise<TimeseriesResponse> {
  const end = toUTCMidnight(new Date());
  const start = toUTCMidnight(subDays(end, RANGE_DAYS[range]));

  if (RANGE_DAYS[range] <= MAX_CHUNK_DAYS) {
    const raw = await get('/timeseries', {
      start_date: format(start, YMD),
      end_date: format(end, YMD),
    });
    return TimeseriesResponse.parse(raw);
  }

  const chunks: Array<{ s: Date; e: Date }> = [];
  let cursor = start;
  const DAY_MS = 86400000;
  while (cursor < end) {
    const chunkEnd = new Date(Math.min(cursor.getTime() + MAX_CHUNK_DAYS * DAY_MS, end.getTime()));
    chunks.push({ s: cursor, e: chunkEnd });
    cursor = new Date(chunkEnd.getTime() + DAY_MS);
  }

  const results = await Promise.all(
    chunks.map((c) =>
      get('/timeseries', {
        start_date: format(c.s, YMD),
        end_date: format(c.e, YMD),
      }).then(TimeseriesResponse.parse),
    ),
  );

  return {
    status: 'success',
    start_date: format(start, YMD),
    end_date: format(end, YMD),
    unit: 'toz',
    rates: Object.assign({}, ...results.map((r) => r.rates)),
  };
}
