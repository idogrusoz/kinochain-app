import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Share, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticLight, hapticMedium } from '../services/settings';
import { track } from '../services/analytics';
import { recordWin } from '../services/stats';
import { markDailyCompleted } from '../services/dailies';
import { buildChainCard } from '../services/share';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { BrassButton } from '../components/ui/BrassButton';
import { OutlineButton } from '../components/ui/OutlineButton';
import { TextButton } from '../components/ui/TextButton';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Icon } from '../components/ui/Icon';
import { ChainView } from '../components/game/ChainView';
import { colors, fonts, radius, type, spacing } from '../../theme';
import i18n, { useLocale } from '../i18n/i18n';

export type WinningScreenProps = StackScreenProps<RootStackParamList, 'Winning'>;

// ── Phase timing constants ─────────────────────────────────────────────
const P1_START = 0;       // marquee dots
const P2_START = 600;     // title + gold line
const P3_START = 1200;    // stats count-up
const P4_START = 1900;    // chain reveal
const P5_START = 2800;    // buttons

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── Animated stat with count-up ────────────────────────────────────────
function AnimatedStat({
  targetValue,
  label,
  formatFn,
  delay,
}: {
  targetValue: number;
  label: string;
  formatFn?: (n: number) => string;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const listener = anim.addListener(({ value }) => {
        const v = Math.round(value);
        setDisplay(formatFn ? formatFn(v) : String(v));
      });
      Animated.timing(anim, {
        toValue: targetValue,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        // Ensure final value is exact
        setDisplay(formatFn ? formatFn(targetValue) : String(targetValue));
      });
      // Throttled haptic ticks during count
      const ticks = Math.min(4, targetValue);
      for (let i = 0; i < ticks; i++) {
        setTimeout(
          () => hapticLight(),
          (i * 500) / ticks,
        );
      }
      return () => anim.removeListener(listener);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={{ alignItems: 'center', opacity }}>
      <Text style={[type.statLarge, { color: colors.textPrimary }]} maxFontSizeMultiplier={1.5}>
        {display}
      </Text>
      <Text style={[type.microLabel, { color: colors.textSecondary, marginTop: 3 }]} maxFontSizeMultiplier={1.5}>
        {label}
      </Text>
    </Animated.View>
  );
}

// ── Shimmer overlay for headline ───────────────────────────────────────
function Shimmer({ delay }: { delay: number }) {
  const translateX = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 400,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[styles.shimmerWrap, { opacity, transform: [{ translateX }] }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['transparent', 'rgba(244,225,172,0.25)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.shimmerGradient}
      />
    </Animated.View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────

export const WinningScreen: React.FC<WinningScreenProps> = ({ route, navigation }) => {
  const localeVersion = useLocale();
  // Pick a random celebratory headline once per screen view (re-picks if the
  // language changes). winning.titles is an array of interchangeable phrases.
  const title = useMemo(() => {
    const titles = i18n.t('winning.titles');
    return Array.isArray(titles)
      ? titles[Math.floor(Math.random() * titles.length)]
      : String(titles);
  }, [localeVersion]);
  const { targetMovie, moves, seconds, chain, fromTutorial, hintUsed, dailyNumber } = route.params;
  const startName = chain[0]?.name ?? '';
  const showNoHintBadge = !fromTutorial && !hintUsed;
  const [streak, setStreak] = useState<number | null>(null);
  const recorded = useRef(false);
  const showStreakBadge = streak != null && streak >= 2;

  useEffect(() => {
    if (recorded.current) return; // guard against StrictMode double-invoke
    recorded.current = true;
    if (fromTutorial) {
      track('tutorial_completed');
      return;
    }
    track('game_won', { moves, seconds, hintUsed: !!hintUsed, daily: dailyNumber != null });
    recordWin({ moves, hintUsed: !!hintUsed })
      .then((s) => setStreak(s.currentStreak))
      .catch(() => {});
    if (dailyNumber != null) {
      markDailyCompleted(dailyNumber, { moves, seconds, hintUsed: !!hintUsed });
    }
  }, []);

  // Phase animation values
  const bulbAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  const titleScale = useRef(new Animated.Value(0.85)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const goldLineWidth = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const chainOpacity = useRef(new Animated.Value(0)).current;
  const buttonAnims = useRef(Array.from({ length: 3 }, () => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;

  useEffect(() => {
    // ── Phase 1: Marquee dots (0–600ms) ──
    bulbAnims.forEach((a, i) => {
      setTimeout(() => {
        Animated.spring(a, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          mass: 1,
          useNativeDriver: true,
        }).start();
      }, P1_START + i * 60);
    });

    // Phase 1 haptic
    setTimeout(() => {
      hapticLight();
    }, 400);

    // ── Phase 2: Title drop (600–1200ms) ──
    setTimeout(() => {
      hapticMedium();
      Animated.spring(titleScale, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        mass: 1,
        useNativeDriver: true,
      }).start();
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, P2_START);

    // Gold line expand
    setTimeout(() => {
      Animated.timing(goldLineWidth, {
        toValue: 1,
        duration: 400,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: false,
      }).start();
    }, P2_START + 50);

    // Subtitle fade
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, P2_START + 300);

    // ── Phase 3: Stats (1200–1900ms) — handled by AnimatedStat ──
    // Divider draws
    setTimeout(() => {
      Animated.timing(dividerWidth, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, P3_START + 500);

    // ── Phase 4: Chain reveal (1900ms) ──
    setTimeout(() => {
      Animated.timing(chainOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, P4_START);

    // ── Phase 5: Buttons (2800ms) ──
    buttonAnims.forEach((b, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(b.opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.spring(b.translateY, {
            toValue: 0,
            damping: 14,
            stiffness: 120,
            mass: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }, P5_START + i * 100);
    });
  }, []);

  const onShare = async () => {
    track('share_tapped', { daily: dailyNumber != null });
    try {
      const message = buildChainCard({
        dayNumber: dailyNumber,
        startName,
        targetTitle: targetMovie.title,
        moves,
        seconds,
        hintUsed: !!hintUsed,
        streak,
      });
      const result = await Share.share({ message });
      track('share_completed', { shared: result.action === Share.sharedAction });
    } catch {
      // user dismissed or share unavailable — nothing to do
    }
  };

  return (
    <View style={styles.container}>
      {/* Phase 1: Marquee dots */}
      <View style={styles.bulbs}>
        {bulbAnims.map((a, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bulb,
              {
                opacity: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, i % 2 ? 0.5 : 1],
                }),
                transform: [{ scale: a }],
              },
            ]}
          />
        ))}
      </View>

      {/* Phase 2: Title + shimmer */}
      <View style={styles.titleWrap}>
        <Animated.Text
          style={[
            type.celebration,
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            },
          ]}
          maxFontSizeMultiplier={1.5}
        >
          {title}
        </Animated.Text>
        <Shimmer delay={P2_START + 400} />
      </View>

      {/* Gold line */}
      <View style={styles.goldLineContainer}>
        <Animated.View
          style={[
            styles.goldLine,
            {
              width: goldLineWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '70%'],
              }),
            },
          ]}
        />
      </View>

      {/* Daily eyebrow */}
      {dailyNumber != null && (
        <Animated.View style={[styles.dailyEyebrow, { opacity: subtitleOpacity }]}>
          <Icon name="daily" size={12} color={colors.gold} />
          <Text style={styles.dailyEyebrowText} maxFontSizeMultiplier={1.4}>
            KINOCHAIN #{dailyNumber}
          </Text>
        </Animated.View>
      )}

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]} maxFontSizeMultiplier={1.5}>
        {i18n.t('winning.linked', { from: startName, to: targetMovie.title })}
      </Animated.Text>

      {/* Phase 3: Stats with count-up */}
      <View style={styles.stats}>
        <AnimatedStat targetValue={moves} label={i18n.t('winning.moves')} delay={P3_START} />
        <View style={styles.dividerWrap}>
          <Animated.View
            style={[
              styles.divider,
              {
                height: dividerWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 40],
                }),
              },
            ]}
          />
        </View>
        <AnimatedStat targetValue={seconds} label={i18n.t('winning.time')} formatFn={formatTime} delay={P3_START} />
      </View>

      {/* Streak + no-hint flex badges (vector icons — emoji don't render in
          a custom-font Text; they stay only in the share string) */}
      {(showStreakBadge || showNoHintBadge) && (
        <Animated.View style={[styles.badgeRow, { opacity: chainOpacity }]}>
          {showStreakBadge && (
            <View style={[styles.badge, styles.badgeStreak]}>
              <Icon name="flame" size={13} color={colors.goldHighlight} />
              <Text style={[styles.badgeText, { color: colors.goldHighlight }]} maxFontSizeMultiplier={1.4}>
                {i18n.t('winning.streak', { n: String(streak) })}
              </Text>
            </View>
          )}
          {showNoHintBadge && (
            <View style={[styles.badge, styles.badgeMerit]}>
              <Icon name="ribbon" size={13} color={colors.goldBright} />
              <Text style={[styles.badgeText, { color: colors.textPrimary }]} maxFontSizeMultiplier={1.4}>
                {i18n.t('winning.noHintBadge')}
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Phase 4: Chain */}
      <Animated.View style={[styles.chainSection, { opacity: chainOpacity }]}>
        <SectionLabel style={styles.chainLabel}>{i18n.t('winning.yourChain')}</SectionLabel>
        <ChainView chain={chain} entranceDelay={P4_START + 200} centered large />
      </Animated.View>

      {/* Phase 5: Buttons */}
      <Animated.View style={{ opacity: buttonAnims[0].opacity, transform: [{ translateY: buttonAnims[0].translateY }] }}>
        <BrassButton
          label={fromTutorial ? i18n.t('winning.startPlaying') : i18n.t('winning.playAgain')}
          onPress={() => navigation.navigate(fromTutorial ? 'Welcome' : 'Game')}
        />
      </Animated.View>
      {!fromTutorial && (
        <>
          <Animated.View style={{ opacity: buttonAnims[1].opacity, transform: [{ translateY: buttonAnims[1].translateY }] }}>
            <OutlineButton
              label={i18n.t('winning.shareResult')}
              icon="share"
              borderColor={colors.borderSubtleGold}
              style={{ marginTop: 10 }}
              onPress={onShare}
            />
          </Animated.View>
          <Animated.View style={[styles.homeWrap, { opacity: buttonAnims[2].opacity, transform: [{ translateY: buttonAnims[2].translateY }] }]}>
            <TextButton label={i18n.t('winning.home')} onPress={() => navigation.navigate('Welcome')} />
          </Animated.View>
        </>
      )}
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
  titleWrap: { alignItems: 'center', overflow: 'hidden' },
  title: { color: colors.goldBright, textAlign: 'center' },
  shimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  shimmerGradient: { flex: 1 },
  goldLineContainer: { alignItems: 'center', marginTop: 6, marginBottom: 4 },
  goldLine: { height: 1, backgroundColor: colors.gold },
  dailyEyebrow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  dailyEyebrowText: { fontFamily: fonts.text.semibold, fontSize: 11, letterSpacing: 1.2, color: colors.gold },
  subtitle: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 16 },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  badgeText: { fontFamily: fonts.text.semibold, fontSize: 12, letterSpacing: 0.2 },
  badgeStreak: { backgroundColor: colors.goldTintBg, borderColor: colors.goldKeyline },
  badgeMerit: { backgroundColor: colors.surfaceRaised, borderColor: colors.borderSubtleGold },
  dividerWrap: { justifyContent: 'center' },
  divider: { width: 1, backgroundColor: colors.border },
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
