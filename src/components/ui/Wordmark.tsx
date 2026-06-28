import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors, fonts } from '../../../theme';

// The KINO/CHAIN two-tone wordmark.
export function Wordmark({
  size = 18,
  letterSpacing = 1,
}: {
  size?: number;
  letterSpacing?: number;
}) {
  const base: TextStyle = {
    fontFamily: fonts.display.bold,
    fontSize: size,
    letterSpacing,
  };
  return (
    <Text style={base} accessibilityRole="header" accessibilityLabel="Kinochain" maxFontSizeMultiplier={1.5}>
      <Text style={{ color: colors.textPrimary }} maxFontSizeMultiplier={1.5}>KINO</Text>
      <Text style={{ color: colors.goldBright }} maxFontSizeMultiplier={1.5}>CHAIN</Text>
    </Text>
  );
}
