import React from 'react';
import { Pressable, Text, TextStyle, StyleSheet } from 'react-native';
import { colors, fonts } from '../../../theme';

// Tertiary action — label only (e.g. Home, How to play, Skip).
export function TextButton({
  label,
  onPress,
  color = colors.textSecondary,
  underline = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  color?: string;
  underline?: boolean;
  style?: TextStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      style={styles.pressable}
    >
      <Text
        maxFontSizeMultiplier={1.5}
        style={[
          {
            fontFamily: fonts.text.medium,
            fontSize: 13,
            color,
            textDecorationLine: underline ? 'underline' : 'none',
          },
          style,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
