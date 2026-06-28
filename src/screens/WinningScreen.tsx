import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { BrassButton } from '../components/ui/BrassButton';
import { OutlineButton } from '../components/ui/OutlineButton';
import { TextButton } from '../components/ui/TextButton';
import { SectionLabel } from '../components/ui/SectionLabel';
import { ChainView } from '../components/game/ChainView';
import { colors, fonts, type, spacing } from '../../theme';

export type WinningScreenProps = StackScreenProps<RootStackParamList, 'Winning'>;

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[type.statLarge, { color: colors.textPrimary }]} maxFontSizeMultiplier={1.5}>{value}</Text>
      <Text style={[type.microLabel, { color: colors.textSecondary, marginTop: 3 }]} maxFontSizeMultiplier={1.5}>
        {label}
      </Text>
    </View>
  );
}

export const WinningScreen: React.FC<WinningScreenProps> = ({ route, navigation }) => {
  const { targetMovie, moves, seconds, chain } = route.params;
  const startName = chain[0]?.name ?? '';

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
  }, []);

  const onShare = () => {
    Share.share({
      message: `KINOCHAIN\n${startName} → ${targetMovie.title}\nSolved in ${moves} moves · ${formatTime(seconds)}`,
    }).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.bulbs}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={[styles.bulb, { opacity: i % 2 ? 0.5 : 1 }]} />
        ))}
      </View>
      <Text style={[type.celebration, styles.title]} maxFontSizeMultiplier={1.5}>That&apos;s a wrap!</Text>
      <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
        You linked {startName} to {targetMovie.title}.
      </Text>

      <View style={styles.stats}>
        <Stat value={String(moves)} label="moves" />
        <View style={styles.divider} />
        <Stat value={formatTime(seconds)} label="time" />
      </View>

      <View style={styles.chainSection}>
        <SectionLabel style={styles.chainLabel}>Your chain</SectionLabel>
        <ChainView chain={chain} />
      </View>

      <BrassButton label="Play again" onPress={() => navigation.navigate('Game')} />
      <OutlineButton
        label="Share result"
        icon="share"
        borderColor={colors.borderSubtleGold}
        style={{ marginTop: 10 }}
        onPress={onShare}
      />
      <View style={styles.homeWrap}>
        <TextButton label="Home" onPress={() => navigation.navigate('Welcome')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
  },
  bulbs: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 8, marginBottom: 12 },
  bulb: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.goldBright },
  title: { color: colors.goldBright, textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 16 },
  divider: { width: 1, height: 40, backgroundColor: colors.border },
  chainSection: {
    flex: 1,
    minHeight: 0,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f20',
  },
  chainLabel: { textAlign: 'center', marginBottom: 12 },
  homeWrap: { alignItems: 'center', marginTop: 14, marginBottom: 16 },
});
