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
- [ ] Enroll in Apple Developer Program.
- [ ] Confirm app name "Kinochain" + bundle id availability.
- [ ] Add `EXPO_PUBLIC_TMDB_API_KEY` to `.env` / `.env.example`.

## Phase 1 — Move game logic on-device  ← DONE (code); simulator pass pending
Ported `kinochain-app-be/src/` logic into the app (keeping the loop/threshold fixes):
- [x] `src/services/tmdb/client.ts` — `tmdbGet` (fetch + `api_key` query param; no URL/searchParams, no new dep; maps snake_case in services).
- [x] `src/services/tmdb/types.ts` — raw TMDB response shapes.
- [x] `src/services/tmdb/movieService.ts` — `fetchMovie` (popularity.desc + filter + retry cap) + `getMovieDetails` (cast + director-only crew, inlined).
- [x] `src/services/tmdb/actorService.ts` — `fetchActorFromMovie` (top-N cast), `getCombinedCreditsOfAnActor`, `getActorDetails`, `processCredits`.
- [x] `src/services/tmdb/gameService.ts` — `createGame` (alternation + caps, local id, no DB).
- [x] Mapped TMDB → existing app models in `types.ts` (no new types file needed app-side).
- [x] Rewired `src/services/gameService.ts` to the on-device layer; removed `apiService.ts` + the backend base URL.
- [x] Both states supported: actor screen (films) and film screen (cast + director).
- [x] No infinite loops (retry caps); env key embedded via `EXPO_PUBLIC_TMDB_API_KEY`.
- [x] Verified: `tsc` clean, `expo export` bundles, live `createGame` smoke test terminates and yields valid games.
- [ ] Loading / empty / error / offline UI states (basic exists; harden in Phase 2/3).
- [ ] Final end-to-end pass on the simulator (manual).

## Phase 2 — Build the redesign (from `design/`)  ← DONE (code); device pass pending
- [x] Fonts (Space Grotesk, Inter via @expo-google-fonts) loaded in App.tsx; theme/tokens in `theme.ts`.
- [x] Components: Icon, Wordmark, BrassButton, OutlineButton, TextButton, SectionLabel, Surface, TargetBanner, PathTracker, ChainView. (CoachMark/StatBlock folded into screens; SegmentedControl inline on Welcome.)
- [x] Screens: Gameplay (actor↔film, target banner, path tracker, timer), Win (moves+time, auto-scroll chain, native Share), Welcome (difficulty + New game + How to play), Splash (mark + wordmark + TMDB, first-run routing), Onboarding (4-step coached).
- [x] In-app logo mark asset (`assets/kinochain-mark.svg`); difficulty wired through to TMDB queries (easy/medium/hard).
- [x] Win-screen auto-scroll. `tsc` clean, `expo export` bundles, `npm audit` 0 vulns.
- [x] Haptics (light impact on pick, success on win) via expo-haptics.
- [x] Chain shows real profile/poster images; current node enlarged + snap-in animation.
- [x] Logo PNG export (`design/logos/png/icon-1024.png` → `assets/icon.png`) via qlmanage; `app.json` icon + native splash rebranded to gold-K-on-charcoal.
- [x] About/settings screen with full TMDB disclaimer.
- [x] Android adaptive icon with a branded, safe-zone foreground and charcoal background.
- Deferred (not dead-shipped): Hint button (needs par/cost logic), Daily challenge (needs backend) — omitted from v1 per FUTURE_IDEAS.
- [ ] Manual device pass of the full flow.

## Phase 3 — Pre-submission polish
- [x] In-app and hosted privacy policy pages.
- [ ] Publish the GitHub Pages policy URL and configure the App Store privacy label.
- [x] Accessibility code pass (Dynamic Type capped at 1.5×, verified contrast, 44pt controls, meaningful labels).
- [x] Typed TMDB network/HTTP errors, offline checks, branded error state, and retry actions.
- [x] About screen with app version, TMDB attribution, privacy, and onboarding links.
- [x] Android adaptive icon foreground and background configuration.
- [ ] Manual VoiceOver, large-text, offline, and Android launcher-mask device pass.
- [ ] App Store Connect listing (screenshots, description, keywords, category, age rating).

## Phase 4 — Ship to feedback
- [ ] EAS Build → **TestFlight** (the cheap feedback loop).
- [ ] Iterate on feedback → submit for App Store review.

## Deferred to v2+ (see FUTURE_IDEAS.md)
Firebase analytics/crashlytics, anonymous auth, persisted puzzle library, daily /
leaderboards / par / personal best, key proxy, soft-integrity anti-cheat.
