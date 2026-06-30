import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { colors, fonts, spacing, radius, type } from '../../theme';
import i18n from '../i18n/i18n';
import { loadStats, currentStreakAsOf, Stats } from '../services/stats';

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue} maxFontSizeMultiplier={1.4}>{value}</Text>
      <Text style={styles.metricLabel} maxFontSizeMultiplier={1.4}>{label}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<Stats | null>(null);

  // Refresh each time the screen is focused so a just-finished game is reflected.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadStats().then((s) => {
        if (active) setStats(s);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const streak = stats ? currentStreakAsOf(stats) : 0;
  const empty = !stats || stats.gamesCompleted === 0;

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('stats.goBack')}
        >
          <Icon name="back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.navTitle} maxFontSizeMultiplier={1.5}>{i18n.t('stats.title')}</Text>
        <View style={styles.navButton} />
      </View>

      {empty ? (
        <View style={styles.emptyWrap}>
          <Icon name="stats" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText} maxFontSizeMultiplier={1.5}>{i18n.t('stats.empty')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Icon name="flame" size={28} color={colors.gold} />
            <Text style={styles.heroValue} maxFontSizeMultiplier={1.4}>{streak}</Text>
            <Text style={styles.heroLabel} maxFontSizeMultiplier={1.4}>{i18n.t('stats.currentStreak')}</Text>
          </View>

          <View style={styles.grid}>
            <MetricCard value={String(stats!.gamesCompleted)} label={i18n.t('stats.gamesPlayed')} />
            <MetricCard value={String(stats!.longestStreak)} label={i18n.t('stats.longestStreak')} />
            <MetricCard
              value={stats!.bestMoves == null ? '—' : String(stats!.bestMoves)}
              label={i18n.t('stats.bestMoves')}
            />
            <MetricCard value={String(stats!.noHintWins)} label={i18n.t('stats.noHintWins')} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: 8,
  },
  navButton: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  navTitle: {
    fontFamily: fonts.display.semibold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 28,
    marginBottom: 8,
  },
  heroValue: { ...type.statLarge, color: colors.goldBright },
  heroLabel: {
    fontFamily: fonts.text.medium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  metricValue: { ...type.statNumber, color: colors.textPrimary },
  metricLabel: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyText: {
    fontFamily: fonts.text.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
