import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { colors, fonts, radius } from '../../../theme';
import { Icon } from '../ui/Icon';
import { SectionLabel } from '../ui/SectionLabel';
import { BrassButton } from '../ui/BrassButton';
import { OutlineButton } from '../ui/OutlineButton';
import i18n from '../../i18n/i18n';
import { getTodayDaily, getDailyCompletion, DailyResult } from '../../services/dailies';
import { loadStats, currentStreakAsOf } from '../../services/stats';
import { buildChainCard } from '../../services/share';
import { track } from '../../services/analytics';

// The Daily Challenge entry point on Welcome. Self-loads today's numbered puzzle
// (local, no network) and whether it's already completed. The target film is
// never shown here — that would spoil the puzzle.
export function DailyCard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [daily, setDaily] = useState(() => getTodayDaily());
  const [result, setResult] = useState<DailyResult | null>(null);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const today = getTodayDaily();
      setDaily(today);
      getDailyCompletion(today.dayNumber).then((r) => active && setResult(r));
      loadStats().then((s) => active && setStreak(currentStreakAsOf(s)));
      return () => {
        active = false;
      };
    }, [])
  );

  const completed = result != null;
  // Show the streak chip whenever there's an active streak (incl. day 1) — in
  // the play state it's the streak to protect, in the completed state it's today's.
  const showStreak = streak >= 1;

  const onShare = async () => {
    if (!result) return;
    track('share_tapped', { daily: true });
    try {
      const message = buildChainCard({
        dayNumber: daily.dayNumber,
        startName: daily.startActorName,
        targetTitle: daily.targetTitle,
        moves: result.moves,
        seconds: result.seconds,
        hintUsed: result.hintUsed,
        streak,
      });
      const r = await Share.share({ message });
      track('share_completed', { shared: r.action === Share.sharedAction });
    } catch {
      // dismissed or unavailable
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Icon name="daily" size={15} color={colors.gold} />
          <SectionLabel color={colors.gold}>{i18n.t('daily.label')}</SectionLabel>
        </View>
        <View style={styles.row}>
          {completed && <Icon name="check" size={14} color={colors.gold} />}
          <Text style={styles.num} maxFontSizeMultiplier={1.4}>#{daily.dayNumber}</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.4}>
          {completed ? i18n.t('daily.solved', { n: String(result!.moves) }) : i18n.t('daily.title')}
        </Text>
        {showStreak && (
          <View style={styles.streakChip}>
            <Icon name="flame" size={12} color={colors.goldHighlight} />
            <Text style={styles.streakText} maxFontSizeMultiplier={1.3}>{streak}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sub} maxFontSizeMultiplier={1.4}>
        {completed ? i18n.t('daily.comeBack') : i18n.t('daily.tagline')}
      </Text>

      {completed ? (
        <OutlineButton
          label={i18n.t('winning.shareResult')}
          icon="share"
          borderColor={colors.gold}
          style={{ marginTop: 12 }}
          onPress={onShare}
        />
      ) : (
        <BrassButton
          label={i18n.t('daily.play')}
          icon="play"
          style={{ marginTop: 12 }}
          onPress={() =>
            navigation.navigate('Game', {
              daily: {
                dayNumber: daily.dayNumber,
                startActorId: daily.startActorId,
                targetMovieId: daily.targetMovieId,
              },
            })
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.card,
    padding: 14,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  num: { fontFamily: fonts.display.semibold, fontSize: 13, color: colors.textSecondary },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  title: { flex: 1, fontFamily: fonts.display.semibold, fontSize: 15, color: colors.textPrimary },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.goldTintBg,
    borderColor: colors.goldKeyline,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 8,
  },
  streakText: { fontFamily: fonts.text.semibold, fontSize: 11, color: colors.goldHighlight },
  sub: { fontFamily: fonts.text.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
