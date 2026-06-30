# Kinochain — release plan (MVP, backend-less)

> Goal: ship a light, low-cost iOS MVP to gather real user feedback. Run all logic
> on-device; defer the backend. See design in [`../design/DESIGN.md`](../design/DESIGN.md)
> and deferred work in [`../../kinochain-app-be/docs/FUTURE_IDEAS.md`](../../kinochain-app-be/docs/FUTURE_IDEAS.md).

## Locked decisions
- **No backend for v1.** Game logic runs on-device; TMDB called directly.
- **TMDB key embedded** in the app (`EXPO_PUBLIC_TMDB_API_KEY`). It's read-only and
  revocable — accept exposure, rotate if abused. No proxy for v1.
- **Login-less** (already done) — no accounts, no sign-in.
- **Onboarding ships in v1** (the chain mechanic is novel; coached first run helps).
- Keep `kinochain-app-be` **dormant** (not deleted) — it's the v2 starting point.
- Only mandatory cost: **Apple Developer Program ($99/yr).** Everything else $0 at MVP scale.

## Apple notes (why backend-less is fine, and easy to change later)
- Apple never asks "do you have a backend" and never rejects for lacking one.
- Login-less avoids the demo-account requirement and Sign in with Apple (4.8).
- Still required regardless of backend: a **privacy policy URL** (free GitHub Pages
  page is fine), a minimal **privacy nutrition label** (≈ "no data collected"),
  **export-compliance** exemption (HTTPS only), and **TMDB attribution**.
- Adding a backend later needs nothing from Apple. New Apple requirements only ever
  come from **accounts** (account deletion 5.1.1; Sign in with Apple 4.8) — not backends.

## Phase 0 — Prereqs
- [x] Enroll in Apple Developer Program.
- [x] Confirm app name "Kinochain" + bundle id (`com.rightword.kinochain`).
- [x] Add `EXPO_PUBLIC_TMDB_API_KEY` to `.env`.

## Phase 1 — Move game logic on-device  ✅ DONE
- [x] TMDB client, movie/actor/game services ported on-device.
- [x] Both states: actor screen (films) and film screen (cast + director).
- [x] Retry caps, env key embedded.
- [x] `tsc` clean, `expo export` bundles.
- [x] Error/offline UI states with branded ErrorScreen + network detection.

## Phase 2 — Build the redesign  ✅ DONE
- [x] Design system (Space Grotesk/Inter, gold+charcoal palette, theme tokens).
- [x] All components: Icon, Wordmark, BrassButton, OutlineButton, TextButton, SectionLabel, Surface, TargetBanner, PathTracker, ChainView.
- [x] All screens: Splash, Welcome, Onboarding, Gameplay, Winning, About, Privacy.
- [x] Haptics, auto-scroll chain, real poster/profile images, difficulty wiring.
- [x] Logo PNG export, branded app icon + splash screen.
- [x] Android adaptive icon with charcoal background.

## Phase 3 — Pre-submission polish  ✅ DONE
- [x] Interactive guided tutorial (real TMDB data, teach-by-doing, Jamie Foxx → Inception path).
- [x] Cinematic win screen (5-phase choreographed reveal, shimmer, count-up, connector pulse, haptic choreography).
- [x] Privacy policy: in-app screen + hosted at https://idogrusoz.github.io/kinochain-app/privacy-policy.html
- [x] About screen with TMDB attribution, version, privacy link, onboarding link.
- [x] Error handling: TmdbError typed errors, offline detection via NetInfo, branded ErrorScreen with retry.
- [x] Accessibility: labels, roles, 44pt tap targets, maxFontSizeMultiplier, contrast verified.
- [x] Android adaptive icon configured.
- [x] App Store listing text drafted (`docs/APP_STORE_LISTING.md`).

## Phase 4 — Ship to feedback

### 4a. Pre-build prerequisites (do first)
- [ ] **Daily pack runway** — currently only 14 puzzles (repeats after 14 days). Run
      `node scripts/generate-dailies.js 365` and commit `src/data/dailies.json`.
- [ ] **Aptabase** — create a free project at aptabase.com, get the app key
      (`A-EU-…`/`A-US-…`). Add `EXPO_PUBLIC_APTABASE_KEY` to local `.env`. Without it,
      analytics is silently off (app still works).
- [ ] **EAS env vars** — `.env` is gitignored, so cloud builds need vars set in EAS for
      the **production** environment: `EXPO_PUBLIC_TMDB_API_KEY` (mandatory — the app
      can't load movies without it) and `EXPO_PUBLIC_APTABASE_KEY`. Use
      `eas env:create --environment production …` or the EAS dashboard.
- [ ] **Device test the full flow** on a dev/preview build: daily play → win → share
      sheet; free game; hint expand/collapse; Stats screen; abandoned-game tracking;
      offline error state; VoiceOver + large text; the redesigned Welcome on a small
      screen (SE) and a tall screen.

### 4b. Build & submit
- [x] Enroll in Apple Developer Program ($99/yr).
- [ ] `eas build --platform ios --profile production` (auto-increments build number).
- [ ] `eas submit --platform ios --profile production` → TestFlight.

### 4c. App Store Connect
- [ ] **Privacy nutrition label — UPDATED, no longer "Data Not Collected":** declare
      **Usage Data → Product Interaction** and **Diagnostics → Other Diagnostic Data**,
      both **Not Linked to You** and **Not Used for Tracking** (exact spec in
      `APP_STORE_LISTING.md`). No App Tracking Transparency prompt needed.
- [ ] Listing text from `docs/APP_STORE_LISTING.md` — consider leading with the **Daily
      Challenge** in the description + promo text now that it ships.
- [ ] Screenshots (iPhone 6.9" + 6.7") — include the **Daily card** and a daily
      result/share; age rating 4+; category Games — Trivia; export compliance already
      declared (`ITSAppUsesNonExemptEncryption=false`).
- [ ] Confirm the updated **privacy-policy.html** is deployed to the hosted GitHub Pages URL.
- [ ] Submit for App Store review.

> Free launch + anonymous analytics is TMDB-compliant. The TMDB commercial license is
> only required before monetization (see memory: tmdb-commercial-license).

## Deferred to v2+ (see FUTURE_IDEAS.md)
Firebase analytics/crashlytics, anonymous auth, persisted puzzle library, daily /
leaderboards / par / personal best, key proxy, soft-integrity anti-cheat, sound design,
star ratings, streak counter, shareable ticket stub.
