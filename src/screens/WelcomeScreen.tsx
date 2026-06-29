import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Mark from '../../assets/kinochain-mark.svg';
import { RootStackParamList } from '../../App';
import { Wordmark } from '../components/ui/Wordmark';
import { BrassButton } from '../components/ui/BrassButton';
import { OutlineButton } from '../components/ui/OutlineButton';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Icon } from '../components/ui/Icon';
import { Difficulty } from '../../types';
import { brass, brassLocations, colors, fonts, radius, spacing } from '../../theme';
import i18n from '../i18n/i18n';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

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

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
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

      <View style={styles.heroRegion}>
        <View style={styles.heroContent}>
          <View style={styles.hero}>
            <Mark width={88} height={88} />
            <Wordmark size={26} letterSpacing={1.6} />
            <Text style={styles.explainer} maxFontSizeMultiplier={1.5}>
              {i18n.t('welcome.subtitle')}
            </Text>
          </View>

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
      </View>

      <SectionLabel style={styles.diffLabel}>{i18n.t('welcome.difficulty')}</SectionLabel>
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
              {selected ? (
              <LinearGradient
                colors={brass as readonly [string, string, string]}
                locations={brassLocations as readonly [number, number, number]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.segSelected}
              >
                <Text style={styles.segSelectedText} maxFontSizeMultiplier={1.5}>{label}</Text>
              </LinearGradient>
              ) : (
                <View style={styles.segItem}>
                  <Text style={styles.segText} maxFontSizeMultiplier={1.5}>{label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <BrassButton
        label={i18n.t('welcome.newGame')}
        icon="play"
        onPress={() => navigation.navigate('Game', { difficulty })}
      />
      <OutlineButton
        label={i18n.t('welcome.howToPlay')}
        icon="help"
        borderColor={colors.borderSubtleGold}
        style={{ marginTop: 10, marginBottom: 18 }}
        onPress={() => navigation.navigate('Onboarding')}
      />
    </View>
  );
}

const motif = StyleSheet.create({
  circle: { width: 40, height: 40, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  square: { width: 34, height: 40, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bar: { width: 20, height: 2, borderRadius: 2, backgroundColor: colors.gold, marginHorizontal: 5 },
  dash: { width: 18, height: 2, marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  dot: { width: 3, height: 2, borderRadius: 1, backgroundColor: colors.gold, marginRight: 3 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.screen },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingVertical: 4, zIndex: 1 },
  topBarButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  heroRegion: { flex: 1, justifyContent: 'center' },
  heroContent: { transform: [{ translateY: -52 }] },
  hero: { alignItems: 'center', gap: 9, paddingTop: 6 },
  explainer: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 230,
  },
  motifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  diffLabel: { textAlign: 'center', marginBottom: 10 },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 20 },
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
  },
  segSelectedText: { fontFamily: fonts.display.semibold, fontSize: 13, letterSpacing: 0.5, color: colors.onGold },
});
