import { init, trackEvent } from '@aptabase/react-native';

// Anonymous, aggregate product analytics via Aptabase (open-source,
// cross-platform — one SDK for iOS and Android). No personal data, no
// advertising identifiers, no cross-app tracking — consistent with the
// app's "no tracking" privacy stance and Apple's ATT-exempt definition.
//
// The key is embedded at build time like the TMDB key. Its prefix encodes
// the region/instance (A-US / A-EU / A-DEV); pass `host` to init only for a
// self-hosted server. With no key set, analytics is disabled and the app
// runs unchanged — telemetry must never be load-bearing.
const KEY = process.env.EXPO_PUBLIC_APTABASE_KEY ?? '';

let enabled = false;

export function initAnalytics(): void {
  if (!KEY) return;
  try {
    init(KEY);
    enabled = true;
  } catch {
    enabled = false;
  }
}

// Day-one event taxonomy (see the plan's Analytics Plan). Names are stable
// contracts the dashboards key off — don't rename without migrating. Props
// must stay PII-free (counts, flags, enums only).
export type AnalyticsEvent =
  | 'app_open'
  | 'game_started'
  | 'game_won'
  | 'game_abandoned'
  | 'game_error'
  | 'hint_revealed'
  | 'share_tapped'
  | 'share_completed'
  | 'tutorial_completed';

export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>
): void {
  if (!enabled) return;
  try {
    trackEvent(event, props);
  } catch {
    // Never let telemetry throw into the app.
  }
}
