# Kinochain TMDB proxy

This Cloudflare Worker exposes only the TMDB routes and query parameters used by
Kinochain. It keeps the TMDB key out of the mobile bundle, caches successful
responses, and rate-limits a salted one-way hash of the caller IP. It does not
write custom logs, and Workers observability is disabled in `wrangler.jsonc`.

## Deploy

1. Authenticate Wrangler:

   ```sh
   npx wrangler@latest login
   ```

2. Add the TMDB v3 API key as an encrypted Worker secret:

   ```sh
   npx wrangler@latest secret put TMDB_API_KEY --config worker/wrangler.jsonc
   ```

3. Deploy:

   ```sh
   npx wrangler@latest deploy --config worker/wrangler.jsonc
   ```

4. Copy the resulting `https://...workers.dev` URL into the app's local `.env`:

   ```dotenv
   EXPO_PUBLIC_API_BASE_URL=https://kinochain-tmdb-proxy.your-subdomain.workers.dev
   ```

5. Create the same `EXPO_PUBLIC_API_BASE_URL` value in the EAS `development`,
   `preview`, and `production` environments. The TMDB key must never be added to
   EAS or committed to this repository.

The Worker is intentionally a public, constrained API. A static "app API key"
would be extractable from the mobile bundle and would not provide authentication.
