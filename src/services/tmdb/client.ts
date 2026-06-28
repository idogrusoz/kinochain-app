const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';
const BASE_URL = 'https://api.themoviedb.org/3';

type Params = Record<string, string | number | boolean | undefined>;

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

export async function tmdbGet<T>(path: string, params: Params = {}): Promise<T> {
  const query = buildQuery({ api_key: API_KEY, language: 'en-US', ...params });
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}${query}`, {
      headers: { accept: 'application/json' },
    });
  } catch {
    throw new TmdbError('network', 'Unable to reach TMDB. Check your internet connection.');
  }
  if (!res.ok) {
    throw new TmdbError('http', `TMDB request failed (${res.status}) for ${path}`, res.status);
  }
  return (await res.json()) as T;
}
