import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brass, brassLocations, colors, radius, type } from '../../../theme';
import { Icon, IconName } from './Icon';

// Primary CTA — brushed-brass gradient with a hairline keyline.
export function BrassButton({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}
    >
      <LinearGradient
        colors={brass as readonly [string, string, string]}
        locations={brassLocations as readonly [number, number, number]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        {icon ? <Icon name={icon} size={16} color={colors.onGold} /> : null}
        <Text style={[type.buttonPrimary, { color: colors.onGold }]} maxFontSizeMultiplier={1.5}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
});
