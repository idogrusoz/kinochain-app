import { TextStyle } from 'react-native';

// Design tokens — see design/DESIGN.md and design/tokens.json (source of truth).
// Dark-only theme.
export const colors = {
  background: '#0E0E10',
  surface: '#141414',
  surfaceRaised: '#1A1A1B',
  border: '#2C2C2E',
  borderRow: '#242426',
  borderSubtleGold: '#3A342A',
  borderGold: '#C9A24A',
  textPrimary: '#F2EEE4',
  textSecondary: '#9A968C',
  textMuted: '#56544D',
  textSoft: '#D8D3C7',
  gold: '#C9A24A',
  goldBright: '#E6CC8A',
  goldHighlight: '#F4E1AC',
  goldDim: '#8A7233',
  goldKeyline: '#6F5B29',
  goldTintBg: '#1C160A',
  onGold: '#15120A',
  error: '#E05050',
} as const;

// Brushed-brass gradient for primary CTAs (use with expo-linear-gradient).
export const brass = ['#F0DCA6', '#C9A24A', '#B8923E'] as const;
export const brassLocations = [0, 0.58, 1] as const;

export const spacing = { xs: 4, sm: 8, md: 12, screen: 16, lg: 18, xl: 24 } as const;
export const radius = { icon: 6, control: 12, card: 14, input: 11, pill: 999 } as const;

export const fonts = {
  display: {
    medium: 'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
  text: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
  },
} as const;

export const type = {
  wordmark: { fontFamily: fonts.display.bold, fontSize: 18, letterSpacing: 1 },
  wordmarkLarge: { fontFamily: fonts.display.bold, fontSize: 24, letterSpacing: 1.5 },
  titleHero: { fontFamily: fonts.display.semibold, fontSize: 22 },
  statLarge: { fontFamily: fonts.display.bold, fontSize: 34 },
  statNumber: { fontFamily: fonts.display.semibold, fontSize: 22 },
  celebration: { fontFamily: fonts.display.bold, fontSize: 25 },
  actorName: { fontFamily: fonts.display.medium, fontSize: 15 },
  listTitle: { fontFamily: fonts.text.medium, fontSize: 15 },
  body: { fontFamily: fonts.text.regular, fontSize: 12, lineHeight: 18 },
  secondary: { fontFamily: fonts.text.regular, fontSize: 12 },
  overline: { fontFamily: fonts.text.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  microLabel: { fontFamily: fonts.text.medium, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  buttonPrimary: { fontFamily: fonts.display.semibold, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

// Legacy palette + theme kept for screens not yet migrated to the tokens above.
export const palette = {
  black: '#171717',
  darkGray: '#444444',
  red: '#DA0037',
  lightGray: '#EDEDED',
  lightBlue: '#01b4e4',
};

export const theme = {
  ...colors,
  primary: colors.gold,
  secondary: colors.textSecondary,
  text: colors.textPrimary,
};
