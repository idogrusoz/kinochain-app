const TMDB_ORIGIN = 'https://api.themoviedb.org';
const TMDB_IMAGE_ORIGIN = 'https://image.tmdb.org';

const ROUTES = [
  { pattern: /^\/3\/discover\/movie$/, ttl: 600, query: 'discover' },
  { pattern: /^\/3\/movie\/\d+$/, ttl: 86400, query: 'basic' },
  { pattern: /^\/3\/movie\/\d+\/credits$/, ttl: 21600, query: 'basic' },
  { pattern: /^\/3\/person\/\d+$/, ttl: 86400, query: 'person' },
  { pattern: /^\/3\/person\/\d+\/movie_credits$/, ttl: 21600, query: 'basic' },
];

const COMMON_QUERY = new Set(['language']);
const DISCOVER_QUERY = new Set([
  ...COMMON_QUERY,
  'include_adult',
  'include_video',
  'page',
  'release_date.gte',
  'sort_by',
  'vote_count.gte',
  'with_original_language',
  'without_genres',
]);
const PERSON_QUERY = new Set([...COMMON_QUERY, 'append_to_response']);

const RESPONSE_HEADERS = {
  'access-control-allow-origin': '*',
  'content-security-policy': "default-src 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};

function jsonError(status, message) {
  return Response.json(
    { error: message },
    { status, headers: RESPONSE_HEADERS }
  );
}

function findRoute(pathname) {
  const apiRoute = ROUTES.find((route) => route.pattern.test(pathname));
  if (apiRoute) return apiRoute;

  const image = pathname.match(
    /^\/image\/(w185|w342|w500|original)\/([A-Za-z0-9_-]+\.(?:jpg|jpeg|png|svg))$/
  );
  if (!image) return undefined;
  return { ttl: 604800, query: 'image', imageSize: image[1], imageFile: image[2] };
}

function allowedQueryFor(route) {
  if (route.query === 'discover') return DISCOVER_QUERY;
  if (route.query === 'person') return PERSON_QUERY;
  return COMMON_QUERY;
}

function isValidQueryValue(key, value) {
  switch (key) {
    case 'language':
      return /^[a-z]{2}-[A-Z]{2}$/.test(value);
    case 'include_adult':
    case 'include_video':
      return value === 'true' || value === 'false';
    case 'page': {
      const page = Number(value);
      return Number.isInteger(page) && page >= 1 && page <= 50;
    }
    case 'release_date.gte':
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    case 'sort_by':
      return value === 'popularity.desc';
    case 'vote_count.gte': {
      const count = Number(value);
      return Number.isInteger(count) && count >= 0 && count <= 100000;
    }
    case 'with_original_language':
      return /^[a-z]{2}$/.test(value);
    case 'without_genres':
      return /^\d+(,\d+)*$/.test(value);
    case 'append_to_response':
      return value === 'movie_credits';
    default:
      return false;
  }
}

function buildUpstreamUrl(requestUrl, route, apiKey) {
  if (route.query === 'image') {
    if ([...requestUrl.searchParams].length > 0) {
      throw new Error('Image requests do not accept query parameters');
    }
    return new URL(
      `/t/p/${route.imageSize}/${route.imageFile}`,
      TMDB_IMAGE_ORIGIN
    );
  }

  const upstream = new URL(requestUrl.pathname, TMDB_ORIGIN);
  const allowedQuery = allowedQueryFor(route);

  for (const [key, value] of requestUrl.searchParams) {
    if (!allowedQuery.has(key) || !isValidQueryValue(key, value)) {
      throw new Error(`Unsupported query parameter: ${key}`);
    }
    upstream.searchParams.append(key, value);
  }

  if (!upstream.searchParams.has('language')) {
    upstream.searchParams.set('language', 'en-US');
  }
  upstream.searchParams.set('api_key', apiKey);
  return upstream;
}

async function rateLimitKey(request, secret) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local-development';
  const bytes = new TextEncoder().encode(`${secret}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

function withPublicHeaders(response, ttl) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(RESPONSE_HEADERS)) {
    headers.set(name, value);
  }
  headers.delete('set-cookie');
  headers.set('cache-control', `public, max-age=${ttl}`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...RESPONSE_HEADERS,
          'access-control-allow-methods': 'GET, OPTIONS',
          'access-control-allow-headers': 'accept',
          'access-control-max-age': '86400',
        },
      });
    }

    if (request.method !== 'GET') {
      return jsonError(405, 'Method not allowed');
    }
    if (!env.TMDB_API_KEY) {
      return jsonError(503, 'Service is not configured');
    }

    const requestUrl = new URL(request.url);
    const route = findRoute(requestUrl.pathname);
    if (!route) {
      return jsonError(404, 'Endpoint not found');
    }

    if (env.RATE_LIMITER) {
      const key = await rateLimitKey(request, env.TMDB_API_KEY);
      const { success } = await env.RATE_LIMITER.limit({ key });
      if (!success) {
        return jsonError(429, 'Too many requests');
      }
    }

    let upstreamUrl;
    try {
      upstreamUrl = buildUpstreamUrl(requestUrl, route, env.TMDB_API_KEY);
    } catch {
      return jsonError(400, 'Invalid request parameters');
    }

    const cache = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { accept: 'application/json' },
    });
    const response = withPublicHeaders(upstreamResponse, route.ttl);

    if (response.ok) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  },
};
