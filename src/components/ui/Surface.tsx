import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, radius } from '../../../theme';

// A bounded surface card (list container, banner, etc.).
export function Surface({
  children,
  borderColor = colors.border,
  style,
}: {
  children: React.ReactNode;
  borderColor?: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor,
          borderRadius: radius.card,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
