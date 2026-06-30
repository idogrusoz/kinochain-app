# Phase 3 — Pre-submission polish

## Context
Kinochain is a React Native (Expo) movie trivia app ready for App Store submission. Phases 1–2 (on-device game logic + redesign) are complete. Phase 3 adds the remaining polish required before submitting: error handling, an About screen, accessibility, Android icon, and a privacy policy. The goal is to meet Apple's requirements and provide a solid user experience when things go wrong.

## Work items (in implementation order)

### 1. Styled error component + error handling
**Why first:** Everything else builds on a working error UX — the About screen links to retry, and accessibility audits need error states to exist.

**New file: `src/components/ui/ErrorScreen.tsx`**
- Full-screen branded component matching the app's design (charcoal bg, gold accents)
- Props: `title`, `message`, `onRetry?`, `onGoBack?`
- Shows the Wordmark, an icon (e.g. `close` or a new `warning` icon), title, message, and one or two buttons (BrassButton for retry, OutlineButton for go back)

**Wire into GameScreen.tsx:**
- `startAGame()` catch block → set an `error` state instead of silently logging
- `handleCreditSelect()` catch block → set an `error` state with retry = refetch
- When `error` is set, render `<ErrorScreen>` instead of the game UI
- Add network check before API calls using `NetInfo` from `@react-native-community/netinfo` (already compatible with Expo) — show offline-specific message

**Wire into WelcomeScreen.tsx:**
- No API calls here currently, but if game start is moved to pre-fetch, handle there too

**TMDB client (`tmdb/client.ts`):**
- Differentiate error types: network error (TypeError from fetch) vs HTTP error (4xx/5xx)
- Export a typed error class `TmdbError` with a `kind` field: `'network' | 'http'`

### 2. About screen
**New file: `src/screens/AboutScreen.tsx`**
- Navigation: add `About` to `RootStackParamList` in App.tsx, register as a Stack.Screen
- Wire the settings icon on WelcomeScreen to `navigation.navigate('About')`
- Content (scrollable):
  - App name + version (from `expo-constants` or hardcoded `1.0.0`)
  - TMDB logo SVG + full disclaimer: *"This product uses the TMDB API but is not endorsed or certified by TMDB"*
  - "Privacy Policy" link → opens in-app browser or links to the GitHub Pages URL
  - "How to Play" → navigates to Onboarding
  - App credit line (e.g. "Made by Ibrahim Dogrusoz")
- Style: matches app theme — dark bg, gold accents, Surface cards for sections

### 3. Privacy policy
**In-app:** A new `src/screens/PrivacyScreen.tsx` with the policy text rendered as styled Text components. Navigable from About screen.

**GitHub Pages:** Create a simple `privacy-policy.html` in a `docs/` or separate branch. Content:
- No personal data collected
- No accounts or login
- Only network calls are to TMDB (read-only, public API)
- No analytics, tracking, or crashlytics in v1
- TMDB privacy policy link
- Contact email for privacy inquiries

### 4. Accessibility pass
**Tap targets (44pt minimum):**
- WelcomeScreen top bar icons (stats, settings) — currently bare `<Icon>` with no Pressable wrapper and no hitSlop. Wrap in `<Pressable>` with `style={{ minWidth: 44, minHeight: 44 }}` and `hitSlop={8}`
- GameScreen nav icons (back, help) — already have `hitSlop={10}`, but verify the Pressable itself is ≥44pt
- Difficulty segment buttons — check height (currently `paddingVertical: 9` + text ≈ 32pt; increase to 44pt)
- CreditsList rows — currently poster 34×48 + padding, likely ≥44pt already but verify

**Accessibility labels:**
- Icon component: add optional `accessibilityLabel` prop, pass through to Ionicons
- All icon usages in screens: add labels ("Go back", "Help", "Settings", "Share", etc.)
- TargetBanner: add `accessibilityLabel` describing the target ("Target: Movie Title (Year)")
- PathTracker: add `accessibilityLabel` summarizing the path ("Path: 3 moves")

**Dynamic Type:**
- Add `allowFontScaling={true}` (default in RN, but verify not disabled anywhere)
- Set `maxFontSizeMultiplier={1.5}` on Text elements to prevent layout breakage at extreme sizes
- Test that layouts don't break at 1.5× scaling (especially the PathTracker horizontal strip and TargetBanner)

**Contrast verification:**
- `textSecondary (#9A968C)` on `background (#0E0E10)` → calculate ratio, must be ≥4.5:1 for body text
- `gold (#C9A24A)` on `background (#0E0E10)` → verify ≥3:1 for non-text elements
- If any fail, adjust the token slightly

### 5. Android adaptive icon
- Export `kinochain-mark.svg` as a 432×432 PNG with the mark centered in the safe zone (inner 66% = ~288px)
- Save as `assets/adaptive-icon.png` (overwrite the old one)
- Update `app.json`:
  ```json
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#0E0E10"
  }
  ```

### 6. Update release plan
- Check off completed Phase 3 items in `docs/RELEASE_PLAN.md`

## Files to create
| File | Purpose |
|------|---------|
| `src/components/ui/ErrorScreen.tsx` | Branded error state component |
| `src/screens/AboutScreen.tsx` | About screen with TMDB disclaimer |
| `src/screens/PrivacyScreen.tsx` | In-app privacy policy |
| `docs/privacy-policy.html` | Hosted privacy policy for App Store |

## Files to modify
| File | Change |
|------|--------|
| `App.tsx` | Add About + Privacy routes to stack and param list |
| `src/screens/WelcomeScreen.tsx` | Wire settings icon → About, wrap icons in Pressable for 44pt targets |
| `src/screens/GameScreen.tsx` | Error state handling, accessibility labels |
| `src/components/ui/Icon.tsx` | Add `accessibilityLabel` prop |
| `src/services/tmdb/client.ts` | Typed error class for network vs HTTP errors |
| `theme.ts` | Add `error` color token (red/amber for error states) |
| `app.json` | Android adaptive icon background color |
| `assets/adaptive-icon.png` | Replace with new branded version |
| `docs/RELEASE_PLAN.md` | Check off Phase 3 items |

## Verification
1. `npx tsc --noEmit` — type check passes
2. `npx expo export` — bundle builds
3. Run on iOS simulator:
   - Welcome → tap settings → About screen renders with TMDB disclaimer
   - About → Privacy Policy → renders policy text
   - Welcome → New Game → game loads; kill network → error screen appears with retry
   - Verify all tap targets ≥ 44pt (use Accessibility Inspector)
   - VoiceOver reads all interactive elements with meaningful labels
4. Android: verify adaptive icon renders correctly in emulator (circle + squircle masks)
