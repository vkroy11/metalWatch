import { formatDistanceToNowStrict, format as formatDate } from 'date-fns';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const INR_PLAIN = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatINR(value: number): string {
  return INR.format(value);
}

export function formatINRPlain(value: number): string {
  return `₹ ${INR_PLAIN.format(value)}`;
}

export function formatINRShort(value: number): string {
  return `₹${INR_PLAIN.format(Math.abs(value))}`;
}

export function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

export function formatUpdatedAgo(ms: number | null | undefined): string {
  if (!ms) return '—';
  const diff = Date.now() - ms;
  if (diff < 30_000) return 'A MOMENT AGO';
  try {
    return `${formatDistanceToNowStrict(new Date(ms), { addSuffix: false }).toUpperCase()} AGO`;
  } catch {
    return '—';
  }
}

export function formatClockTime(ms: number): string {
  return formatDate(new Date(ms), 'HH:mm');
}

export function formatShortDate(ms: number): string {
  return formatDate(new Date(ms), 'dd MMM').toUpperCase();
}
