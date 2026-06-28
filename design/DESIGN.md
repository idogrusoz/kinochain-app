# Kinochain — design language

> Source of truth for Kinochain's visual + interaction design. Written for humans **and** future coding agents, including a possible Swift (SwiftUI) / Kotlin (Compose) port. Machine-readable values live in [`tokens.json`](./tokens.json); this document explains intent, usage, and component/screen specs. Deferred ideas live in the backend's [`docs/FUTURE_IDEAS.md`](../../../kinochain-app-be/docs/FUTURE_IDEAS.md).
>
> Last updated: 2026-06-28. Status: foundation + all core screens designed (splash, welcome, onboarding, gameplay, win). Remaining work is in [Deferred](#14-deferred--roadmap).

## 1. Brand essence

Kinochain is a six-degrees-of-separation movie puzzle for **cinephiles**. The design must feel **playful but elegant and grown-up** — never childish, or the audience disengages. Reference points: the familiarity of IMDb mobile and the modern restraint of Letterboxd, dressed in an **old-cinema** wardrobe — black-and-white film with **metallic gold** details, like an Art Deco movie palace.

Three principles, in priority order:
1. **Goal-first.** The target film is the most important thing on screen.
2. **Show the chain.** The player's path (actor → film → actor → film) is the core fantasy; make it visible and rewarding.
3. **Gold means something.** Reserve gold for the goal, progress, and primary actions. Everything else is charcoal and off-white.

## 2. Platform & guidelines

iOS-first, aligned to Apple's Human Interface Guidelines (HIG). Patterns to honor: nav bar with centered title, **inset grouped lists**, SF Symbols, **44pt minimum tap targets**, safe-area insets (notch / Dynamic Island top, home-indicator bottom), Dynamic Type, haptics, and **state preservation/restoration** (never destroy a game on backgrounding — see [§10](#10-scoring--rules)). The theme is **dark only**. A future Compose port should mirror these with Material equivalents while keeping the visual language identical.

## 3. Color

See `tokens.json → color` for exact values. Roles:

| Role | Token | Hex | Use |
|---|---|---|---|
| App background | `background.base` | `#0E0E10` | Screen canvas |
| Surface | `background.surface` | `#141414` | Cards, list containers, banners |
| Raised surface | `background.surfaceRaised` | `#1A1A1B` | Chips, current-node fill |
| Hairline border | `border.hairline` | `#2C2C2E` | Card/list borders |
| Divider | `border.divider` | `#242426` | Row separators |
| Primary text | `text.primary` | `#F2EEE4` | Titles, names (warm off-white = "aged film") |
| Secondary text | `text.secondary` | `#9A968C` | Years, captions, inactive icons |
| Muted | `text.muted` | `#56544D` | Placeholder glyphs |
| Gold base | `gold.base` | `#C9A24A` | Accent borders, chevrons, labels |
| Gold bright | `gold.bright` | `#E6CC8A` | Highlights, key numbers, current/target nodes |
| Gold deep | `gold.deep` | `#8A7233` | Metallic shadow (logo, gradients) |
| Brass (CTA) | `brass` | gradient | Primary buttons + selected difficulty; dark label `#15120A` |
| TMDB | `tmdbAttribution` | teal gradient | Attribution logo only |

**Contrast:** gold `#C9A24A` on `#0E0E10` ≈ 6.4:1, secondary `#9A968C` ≈ 6.0:1 — both pass WCAG AA for text. Verify thin gold strokes (dividers, dashed path line) meet the 3:1 non-text bar; thicken if needed. Never set small secondary text in a high-contrast display face on dark.

## 4. Typography

Two families (`tokens.json → typography`):
- **Space Grotesk** — *display voice*: wordmark, hero/target titles, big stat numbers, actor names, primary button labels. Modern geometric; carries the premium, contemporary feel.
- **Inter** — *text voice*: list titles, body, captions, labels. Native fallback: SF Pro / system.

The original serif (Playfair Display) was dropped — it read **dated**, not retro. The modern sans pairing keeps the app current while the palette carries the cinema nostalgia. Wordmark is two-tone: `KINO` off-white + `CHAIN` gold.

Rules: sentence case everywhere except the wordmark and the uppercase primary-button label; never render below 11pt; map each custom-font style to an iOS text style so Dynamic Type still scales it.

## 5. Spacing, radius, layout

- Spacing scale `4 / 6 / 8 / 12 / 16 / 22`; screen horizontal margin ≈ **16pt**.
- Radius: poster thumb `4`, controls/buttons `12`, cards & lists `14`, pills `full`.
- Borders `1px` hairline (`#2C2C2E`); gold accent border `1px`/`1.5px`.
- Respect safe areas; keep primary actions in the bottom (thumb) zone.

## 6. Iconography

**SF Symbols** on iOS (outline weight, gold or secondary tint). Shape language is load-bearing: **circle = actor, square = film, flagged gold square = target.** Mapping from the prototype's Tabler icons:

| Meaning | Tabler | SF Symbol |
|---|---|---|
| Back | `chevron-left` | `chevron.backward` |
| Help | `help-circle` | `questionmark.circle` |
| Settings | `settings` | `gearshape` |
| Stats | `chart-bar` | `chart.bar` |
| Film | `movie` | `film` |
| Actor | `user` | `person.fill` |
| Director | `movie` (gold) | `megaphone` / `person.fill` + tag |
| Target | `flag` | `flag.fill` |
| Disclosure | `chevron-right` | `chevron.right` |
| Hint | `bulb` | `lightbulb` |
| Daily | `calendar-star` | `calendar` |
| Streak | `flame` | `flame.fill` |
| Share | `share-2` | `square.and.arrow.up` |
| Play | `player-play` | `play.fill` |

## 7. Motion & haptics ("juice")

The signature feel is the chain growing.
- **Row tap** → light impact haptic; advance to the picked node.
- **Node lock-in** → the new node animates *along* the gold connector and snaps into the solid chain; the dashed remainder to the target shortens. Medium impact haptic.
- **Win** → the chain fills/auto-pans in gold; success haptic; a marquee-light / projector-flicker flourish (on-theme, not generic confetti).
- Durations ~180–240ms, ease-out.

## 8. Components

- **Primary button (brass CTA).** Brushed-metal fill (`brass` gradient), `1px` `#8A7233` keyline, radius 14, label in `buttonPrimary` (uppercase, dark `#15120A`). Height ≥44pt. Used for New game / Play again, and the selected difficulty segment.
- **Secondary button (outline).** Transparent fill, `1px` `border` (or subtle gold `#3A342A`), `text.primary` label, radius 14. Used for Daily challenge, Share, Hint.
- **Text button.** Label only (`text.secondary`), e.g. Home, How to play, Skip.
- **Segmented control (difficulty).** Three equal segments; selected = brass pill, others = outline + muted label.
- **List row (inset grouped).** Inside a `surface` container (radius 14, hairline). Row = thumb (film 34×48 r4, or actor 38pt circle) + `listTitle` + secondary line + gold `chevron.right`; separator `divider` inset to text. Whole row ≥44pt tap target.
- **Target banner.** `surface` card, **1px gold border**, radius 14: poster (50×72, gold keyline) + `overline` "Target" (gold) + `heroTitle` film + `body` "year · genre". Persistent — never scrolls away.
- **Path tracker.** Horizontal strip; circles = actors, squares = films, 1px gold connectors. Past nodes collapse to a `‹ N` chip; the **current node** (42pt, `gold.bright` ring) and **target** always stay visible; dashed gold line = remaining distance. Current actor name sits under the strip.
- **Chain visualization (win).** Vertical list of nodes + 2px gold connectors, alternating circle/square, ending on the flagged gold target. Lives in a fixed-height **auto-scrolling** viewport with a top fade for long chains.
- **Coach mark.** Dim the screen, spotlight one live element (gold ring), and float a small gold-bordered card (title + one action line) with a step dot indicator + Skip. Teach by doing.
- **Stat block.** `statLarge` number + `microLabel` caption; paired with a thin divider (e.g. Moves | Time).

## 9. Screens

### 9.1 Splash
Static launch screen (HIG: no spinner on the launch screen itself). Centered film-strip logo mark (perforations cut to the background) + two-tone wordmark + tagline "Six degrees of cinema". Footer: "Powered by" + the **TMDB logo** ([`assets/tmdb-logo.svg`](../assets/tmdb-logo.svg), required attribution). Any "preparing your game" loading state belongs on a screen *after* launch.

### 9.2 Welcome / new game
Top: stats + settings icons. Center: logo mark + wordmark + one-line goal explainer + a **chain motif** (actor → film → actor → dashed → target) previewing the concept. Then a **Difficulty** segmented control (Easy / Medium / Hard → sets chain length & obscurity), the brass **New game** CTA, a **Daily challenge** outline button with a streak count, and a **How to play** text link (replays onboarding).

### 9.3 Onboarding (coached first run)
Fires on first launch; replayable from "How to play"; **Skip** always available. Four coach-mark steps over the live game (teach by doing):
1. **Your goal** — spotlight the target: reach this film.
2. **Make a move** — spotlight the actor's film list: tap any film they were in.
3. **Pick a person** — on the resulting *film* screen, spotlight the cast & crew list: pick a co-star **or the director** to continue.
4. **Keep the chain going** — alternate until you reach the target; fewer moves win → "Got it".

### 9.4 Gameplay
Top → bottom: status bar → nav (back · wordmark · help) → **Target banner** → **Path tracker** (+ current node name) → section label → **inset list** → **Hint** button.

**Alternation rule.** Two mirror states:
- *Actor screen* — list shows the actor's **films** (their credits). Each row shows the actor's **character** (e.g. "as Marla Singer").
- *Film screen* — list shows the film's **people**: cast (actors) **and the director** (crew), each a valid hop.

Tapping alternates actor → film → actor → film until the target film is reached. **No Undo button** — re-pick the node that led here to step back.

**API note (important):** the actor screen's character labels come from the single `combined_credits` call already made — **no per-row calls**. A film screen's people come from one `/movie/{id}/credits` call (full cast + crew at once). Showing real **co-stars** on the actor screen would cost one `/credits` call *per row* — too heavy for TMDB's free tier; deferred (see FUTURE_IDEAS). Fall back to year-only when `character` is empty/"Self".

### 9.5 Win / results
Marquee-light flourish + "That's a wrap!" headline naming the connection. **Stats: Moves + Time** (no personal best — see §10). Hero = the solved **chain visualization** that auto-scrolls through the journey and lands on the gold target. Actions: brass **Play again** (new random game), **Share result** (outline), **Home** (text). Share is **spoiler-free**: start → target, moves, time — not the path.

## 10. Scoring & rules

- **Moves** — count of picks in the run.
- **Time** — elapsed time for the run.
- **Difficulty** — sets chain length / film obscurity (Easy/Medium/Hard).
- **No par, personal best, or stars yet.** Games are randomly generated and unique, so a "best" has nothing to compare against and par would require expensive live graph traversal. Both become meaningful only with the **persisted puzzle library** (FUTURE_IDEAS) and are deferred. (The early gameplay mock's "Hint · −1★" is superseded: stars are gone.)
- **Hint** — available; for now it carries no star cost. A penalty (e.g. +1 move, or an "assisted" flag) arrives with competitive modes.
- **Integrity / anti-cheat** — do **not** reset on backgrounding (punishes honest interrupted players, fails against second-device cheats, fights HIG). Use a *soft integrity flag* in competitive modes instead (FUTURE_IDEAS).

## 11. Logo & app icon

Mark: **"Perforated K"**, full-film-strip variant — a K whose stem is a full-height film strip; gold-leaf metallic (`logoGradient`: `#F4E1AC → #C9A24A → #8A7233`, `#6F5B29` keyline) on charcoal. Source of truth: [`logos/logo.svg`](./logos/logo.svg). Alternates explored: [`logos/01–05`](./logos).

Usage: full-bleed charcoal background; do **not** add a rounded border (iOS masks to a squircle); clear space ≈ 10%; min usable size 60px; don't recolor, stretch, or place on light. App Store uploads must be flattened (no alpha); Expo flattens at build.

**PNG exports still to be generated** from `logo.svg`: `icon-1024` (App Store), plus iOS set sizes (180, 120, 87, 80, 60, 40). Pending a converter.

## 12. TMDB attribution

Required by TMDB's API terms. Use their official logo ([`assets/tmdb-logo.svg`](../assets/tmdb-logo.svg)) — the only place the teal/blue appears. The full disclaimer *"This product uses the TMDB API but is not endorsed or certified by TMDB"* belongs on an **about / settings** screen (not the splash).

## 13. Platform mapping (port hints)

| Concept | SwiftUI | Jetpack Compose |
|---|---|---|
| Inset grouped list | `List` `.insetGrouped` | `LazyColumn` + `Card`/`Surface` |
| Nav bar | `NavigationStack` + toolbar | `TopAppBar` |
| Segmented difficulty | `Picker` `.segmented` (restyled) | `SegmentedButton` |
| Brass CTA | `Button` + `LinearGradient` bg | `Button` + `Brush.linearGradient` |
| Haptics | `UIImpactFeedbackGenerator` | `HapticFeedback` |
| Coach mark | overlay + spotlight mask | `Popup`/overlay + scrim |
| Custom fonts + Dynamic Type | `Font.custom(_:size:relativeTo:)` | `FontFamily` + scalable `sp` |
| Dark-only | force `.dark` color scheme | dark `ColorScheme` |

## 14. Deferred / roadmap

Tracked in [`kinochain-app-be/docs/FUTURE_IDEAS.md`](../../../kinochain-app-be/docs/FUTURE_IDEAS.md): persisted puzzle library (→ par, personal best, leaderboards, daily challenge), co-stars via caching, soft-integrity anti-cheat, "gave up" state, post-win "shortest was N" reveal. Also pending: logo PNG export; an about/settings screen.

## 15. Decision log

- **2026-06-27** — Palette: black-and-white film + metallic gold (cinema-palace).
- **2026-06-27** — Typography: Playfair Display (dated) → Space Grotesk (display) + Inter (text); two-tone wordmark.
- **2026-06-27** — Removed Undo (redundant with re-picking).
- **2026-06-27** — Actor-screen rows show character (free) instead of co-stars (per-row API cost too high for free tier).
- **2026-06-27** — Target made a persistent dominant banner; path tracker is the hero.
- **2026-06-27** — Logo: "Perforated K", full-film-strip variant (`logo.svg`).
- **2026-06-28** — Scoring simplified to **Moves + Time**; par / personal best / stars deferred to the persisted-puzzle library (unique random puzzles make them meaningless now). Hint star-cost dropped.
- **2026-06-28** — Designed splash, welcome, 4-step coached onboarding (incl. director as a hop), and win/results (auto-scrolling chain, spoiler-free share).
- **2026-06-28** — Anti-cheat: rejected hard reset-on-leave; chose soft-integrity flag for future competitive modes.
- **2026-06-28** — Primary CTA style: brushed-brass gradient button.
