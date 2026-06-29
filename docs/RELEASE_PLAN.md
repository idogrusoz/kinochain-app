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
- [ ] Enroll in Apple Developer Program ($99/yr).
- [ ] `eas build --platform ios --profile production` → TestFlight.
- [ ] Take App Store screenshots (5 screens, iPhone 6.9" + 6.7").
- [ ] Configure App Store Connect: listing text, screenshots, privacy label ("Data Not Collected"), age rating (4+), export compliance.
- [ ] Manual device testing: VoiceOver, large text, offline, full flow.
- [ ] Submit for App Store review.

## Deferred to v2+ (see FUTURE_IDEAS.md)
Firebase analytics/crashlytics, anonymous auth, persisted puzzle library, daily /
leaderboards / par / personal best, key proxy, soft-integrity anti-cheat, sound design,
star ratings, streak counter, shareable ticket stub.
