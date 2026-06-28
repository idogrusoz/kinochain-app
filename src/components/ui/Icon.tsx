import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme';

// Semantic icon names → Ionicons glyphs (cross-platform stand-ins for the
// SF Symbols mapped in design/DESIGN.md §6). Centralized so we can swap the
// icon set later (e.g. expo-symbols on iOS) without touching screens.
const MAP = {
  back: 'chevron-back',
  forward: 'chevron-forward',
  help: 'help-circle-outline',
  settings: 'settings-outline',
  film: 'film-outline',
  person: 'person',
  director: 'megaphone-outline',
  flag: 'flag',
  hint: 'bulb-outline',
  daily: 'calendar-outline',
  flame: 'flame',
  share: 'share-outline',
  play: 'play',
  close: 'close',
  swap: 'swap-vertical-outline',
  check: 'checkmark',
  warning: 'warning-outline',
  info: 'information-circle-outline',
} as const;

export type IconName = keyof typeof MAP;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

export function Icon({ name, size = 20, color = colors.textSecondary, accessibilityLabel }: Props) {
  const glyph = MAP[name] as React.ComponentProps<typeof Ionicons>['name'];
  return (
    <Ionicons
      name={glyph}
      size={size}
      color={color}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
    />
  );
}
