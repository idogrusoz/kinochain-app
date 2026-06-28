import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../../../theme';
import { Icon, IconName } from './Icon';

// Secondary action — transparent fill, hairline border.
export function OutlineButton({
  label,
  onPress,
  icon,
  color = colors.textPrimary,
  borderColor = colors.border,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  color?: string;
  borderColor?: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        { borderColor, backgroundColor: pressed ? colors.surfaceRaised : 'transparent' },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={17} color={color} /> : null}
      <Text style={[styles.label, { color }]} maxFontSizeMultiplier={1.5}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  label: { fontFamily: fonts.text.medium, fontSize: 14 },
});
