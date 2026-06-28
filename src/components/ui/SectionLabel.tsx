import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors, type } from '../../../theme';

// Uppercase tracked overline used for section headers.
export function SectionLabel({
  children,
  color = colors.textSecondary,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}) {
  return <Text style={[type.overline, { color }, style]} maxFontSizeMultiplier={1.5}>{children}</Text>;
}
