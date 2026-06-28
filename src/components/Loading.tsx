import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { colors, fonts } from '../../theme';
import { Wordmark } from './ui/Wordmark';

export default function Loading({
  label = 'Setting the scene…',
}: {
  label?: string;
}) {
  return (
    <View style={styles.container}>
      <Wordmark size={22} />
      <ActivityIndicator
        color={colors.gold}
        style={{ marginTop: 22 }}
        size="small"
      />
      <Text style={styles.label} maxFontSizeMultiplier={1.5}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.text.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
