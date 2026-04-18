import { ApiErrorResponse } from './schemas';

const BASE_URL = process.env.EXPO_PUBLIC_METALS_BASE_URL ?? 'https://api.metals.dev/v1';
const API_KEY = process.env.EXPO_PUBLIC_METALS_API_KEY ?? '';

export class MetalsApiError extends Error {
  readonly code: string | number | undefined;
  constructor(message: string, code?: string | number) {
    super(message);
    this.name = 'MetalsApiError';
    this.code = code;
  }
}

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  url.searchParams.set('api_key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!API_KEY) {
    throw new MetalsApiError('EXPO_PUBLIC_METALS_API_KEY is not set — check your .env file.');
  }
  const res = await fetch(buildUrl(path, params));
  const raw: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const parsed = ApiErrorResponse.safeParse(raw);
    const msg = parsed.success
      ? parsed.data.error_message ?? parsed.data.message ?? res.statusText
      : res.statusText;
    throw new MetalsApiError(msg, parsed.success ? parsed.data.error_code ?? res.status : res.status);
  }
  if (raw && typeof raw === 'object' && 'status' in raw && (raw as { status: string }).status !== 'success') {
    const parsed = ApiErrorResponse.safeParse(raw);
    const msg = parsed.success
      ? parsed.data.error_message ?? parsed.data.message ?? 'API error'
      : 'API error';
    const code = parsed.success ? parsed.data.error_code : undefined;
    throw new MetalsApiError(msg, code);
  }
  return raw as T;
}
