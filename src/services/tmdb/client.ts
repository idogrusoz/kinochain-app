const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

type Params = Record<string, string | number | boolean | undefined>;
type TmdbImageSize = 'w185' | 'w342' | 'w500' | 'original';

export class TmdbError extends Error {
  kind: 'network' | 'http';
  status?: number;

  constructor(kind: 'network' | 'http', message: string, status?: number) {
    super(message);
    this.name = 'TmdbError';
    this.kind = kind;
    this.status = status;
  }
}

function buildQuery(params: Params): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export function tmdbImageUrl(path: string, size: TmdbImageSize = 'w185'): string {
  const file = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/image/${size}/${encodeURIComponent(file)}`;
}

export async function tmdbGet<T>(path: string, params: Params = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new TmdbError('http', 'Kinochain API URL is not configured.');
  }

  const query = buildQuery({ language: 'en-US', ...params });
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/3${path}${query}`, {
      headers: { accept: 'application/json' },
    });
  } catch {
    throw new TmdbError('network', 'Unable to reach Kinochain. Check your internet connection.');
  }
  if (!res.ok) {
    throw new TmdbError('http', `Kinochain request failed (${res.status}) for ${path}`, res.status);
  }
  return (await res.json()) as T;
}
