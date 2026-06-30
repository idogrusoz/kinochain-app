import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import Mark from '../../assets/kinochain-mark.svg';
import { RootStackParamList } from '../../App';
import { Wordmark } from '../components/ui/Wordmark';
import { BrassButton } from '../components/ui/BrassButton';
import { OutlineButton } from '../components/ui/OutlineButton';
import { TextButton } from '../components/ui/TextButton';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Icon } from '../components/ui/Icon';
import { DailyCard } from '../components/game/DailyCard';
import { Difficulty } from '../../types';
import { colors, fonts, radius, spacing } from '../../theme';
import { getTodayDaily, getDailyCompletion } from '../services/dailies';
import i18n from '../i18n/i18n';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

// Decorative chain glyph under the hero: actor — film — actor ··· target.
function MotifNode({
  kind,
  emphasized,
  target,
}: {
  kind: 'actor' | 'film';
  emphasized?: boolean;
  target?: boolean;
}) {
  const isActor = kind === 'actor';
  const border = target || emphasized ? colors.goldBright : colors.borderSubtleGold;
  return (
    <View
      style={[
        isActor ? motif.circle : motif.square,
        { borderColor: target ? colors.gold : border, backgroundColor: target ? colors.goldTintBg : colors.surface },
      ]}
    >
      <Icon
        name={target ? 'flag' : isActor ? 'person' : 'film'}
        size={isActor ? 19 : 15}
        color={emphasized || target ? colors.goldBright : colors.textSecondary}
      />
    </View>
  );
}

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [dailyDone, setDailyDone] = useState(false);

  // Refresh daily-completion when Welcome is focused (e.g. after finishing
  // today's puzzle) so the New-game brass promotion stays current.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const today = getTodayDaily();
      getDailyCompletion(today.dayNumber).then((r) => active && setDailyDone(r != null));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.topBarButton}
          hitSlop={8}
          onPress={() => navigation.navigate('Stats')}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('welcome.stats')}
        >
          <Icon name="stats" size={21} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          style={styles.topBarButton}
          hitSlop={8}
          onPress={() => navigation.navigate('About')}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('welcome.about')}
        >
          <Icon name="settings" size={21} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Mark width={72} height={72} />
          <Wordmark size={24} letterSpacing={1.6} />
          <Text style={styles.explainer} maxFontSizeMultiplier={1.4}>
            {i18n.t('welcome.subtitle')}
          </Text>

          <View style={styles.motifRow}>
            <MotifNode kind="actor" emphasized />
            <View style={motif.bar} />
            <MotifNode kind="film" />
            <View style={motif.bar} />
            <MotifNode kind="actor" />
            <View style={motif.dash}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={motif.dot} />
              ))}
            </View>
            <MotifNode kind="film" target />
          </View>
        </View>

        <View style={styles.spacer} />

        <DailyCard />

        <View style={styles.spacer} />

        <View>
          <SectionLabel style={styles.freePlayLabel}>{i18n.t('welcome.freePlay')}</SectionLabel>
          <View style={styles.segment}>
            {DIFFICULTIES.map((d) => {
              const label = d[0].toUpperCase() + d.slice(1);
              const selected = d === difficulty;
              return (
                <Pressable
                  key={d}
                  style={styles.segPressable}
                  onPress={() => setDifficulty(d)}
                  accessibilityRole="radio"
                  accessibilityLabel={i18n.t('welcome.difficultyA11y', { level: label })}
                  accessibilityState={{ checked: selected }}
                >
                  <View style={selected ? styles.segSelected : styles.segItem}>
                    <Text
                      style={selected ? styles.segSelectedText : styles.segText}
                      maxFontSizeMultiplier={1.5}
                    >
                      {label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {dailyDone ? (
            <BrassButton
              label={i18n.t('welcome.newGame')}
              icon="play"
              onPress={() => navigation.navigate('Game', { difficulty })}
            />
          ) : (
            <OutlineButton
              label={i18n.t('welcome.newGame')}
              icon="play"
              borderColor={colors.borderSubtleGold}
              onPress={() => navigation.navigate('Game', { difficulty })}
            />
          )}

          <View style={styles.howToWrap}>
            <TextButton label={i18n.t('welcome.howToPlay')} onPress={() => navigation.navigate('Onboarding')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.screen },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, zIndex: 1 },
  topBarButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },

  body: { flexGrow: 1, paddingBottom: 16 },
  spacer: { flex: 1, minHeight: spacing.lg },

  hero: { alignItems: 'center', gap: 8, paddingTop: 8 },
  explainer: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 2,
  },
  motifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6 },

  freePlayLabel: { textAlign: 'center', marginBottom: 12 },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segPressable: { flex: 1, minHeight: 44 },
  segItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segText: { fontFamily: fonts.text.regular, fontSize: 13, color: colors.textSecondary },
  segSelected: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldTintBg,
  },
  segSelectedText: { fontFamily: fonts.display.semibold, fontSize: 13, letterSpacing: 0.5, color: colors.goldBright },

  howToWrap: { alignItems: 'center', marginTop: 10 },
});

const motif = StyleSheet.create({
  circle: { width: 40, height: 40, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  square: { width: 34, height: 40, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bar: { width: 20, height: 2, borderRadius: 2, backgroundColor: colors.gold, marginHorizontal: 5 },
  dash: { width: 18, height: 2, marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  dot: { width: 3, height: 2, borderRadius: 1, backgroundColor: colors.gold, marginRight: 3 },
});
