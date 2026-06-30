import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  AccessibilityInfo,
} from 'react-native';
import { colors, radius, type, fonts } from '../../../theme';
import { Icon } from '../ui/Icon';
import { SectionLabel } from '../ui/SectionLabel';
import { hapticLight, hapticSelection } from '../../services/settings';
import i18n from '../../i18n/i18n';

// LayoutAnimation needs an explicit opt-in on (old-architecture) Android.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type TargetHintPerson = { name: string; poster: string | null };
export type TargetHint = {
  directors: TargetHintPerson[];
  cast: TargetHintPerson[];
};

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';

function firstName(name: string): string {
  return name.split(' ')[0];
}

// Circular person thumbnail (director 28, cast 52), with a graceful
// person-icon placeholder when TMDB has no profile photo.
function Thumb({ poster, size }: { poster: string | null; size: number }) {
  return (
    <View style={[styles.thumb, { width: size, height: size }]}>
      {poster ? (
        <Image source={{ uri: `${TMDB_IMG}${poster}` }} style={{ width: size, height: size }} />
      ) : (
        <Icon name="person" size={Math.round(size * 0.5)} color={colors.textMuted} />
      )}
    </View>
  );
}

// The persistent, dominant goal: reach this film. Tapping the hint button
// expands the banner in-place (pushing the rest of the screen down) to reveal
// the target film's director and top-billed cast.
export function TargetBanner({
  title,
  year,
  poster,
  hint,
  hintLoading,
  hintError,
  onRetryHint,
  onHintRevealed,
}: {
  title: string;
  year: string;
  poster: string | null;
  hint?: TargetHint | null;
  hintLoading?: boolean;
  hintError?: boolean;
  onRetryHint?: () => void;
  onHintRevealed?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const revealedOnce = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (active) reduceMotion.current = v;
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      reduceMotion.current = v;
    });
    return () => {
      active = false;
      sub?.remove?.();
    };
  }, []);

  const toggle = () => {
    const next = !expanded;
    if (!reduceMotion.current) {
      LayoutAnimation.configureNext({
        duration: next ? 220 : 180,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
    }
    setExpanded(next);
    if (next) {
      hapticLight();
      AccessibilityInfo.announceForAccessibility(i18n.t('target.hint.revealed'));
      if (!revealedOnce.current) {
        revealedOnce.current = true;
        onHintRevealed?.();
      }
    } else {
      hapticSelection();
    }
  };

  const directors = hint?.directors ?? [];
  const cast = hint?.cast ?? [];
  const showSkeleton = hintLoading || (!hint && !hintError);
  const noData = !showSkeleton && !hintError && directors.length === 0 && cast.length === 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.poster}>
          {poster ? (
            <Image source={{ uri: `${TMDB_IMG}${poster}` }} style={styles.posterImg} />
          ) : (
            <Icon name="film" size={20} color={colors.gold} />
          )}
        </View>
        <View
          style={styles.headerText}
          accessible
          accessibilityRole="summary"
          accessibilityLabel={i18n.t('target.a11y', { title, year: year ? `(${year})` : '' })}
        >
          <SectionLabel color={colors.gold}>{i18n.t('target.label')}</SectionLabel>
          <Text style={[type.titleHero, styles.title]} numberOfLines={1} maxFontSizeMultiplier={1.5}>
            {title}
          </Text>
          {!!year && (
            <Text style={[type.secondary, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>{year}</Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={toggle}
        hitSlop={10}
        style={[styles.hintBtn, expanded && styles.hintBtnActive]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={i18n.t(expanded ? 'target.hint.collapse' : 'target.hint.reveal')}
        accessibilityHint={i18n.t('target.hint.describe')}
      >
        <Icon name={expanded ? 'chevronUp' : 'hint'} size={18} color={colors.gold} />
      </Pressable>

      {expanded && (
        <View style={styles.panel}>
          <View style={styles.divider} />

          {showSkeleton ? (
            <HintSkeleton />
          ) : hintError ? (
            <Pressable
              onPress={onRetryHint}
              style={styles.errorRow}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('target.hint.error')}
            >
              <Icon name="info" size={15} color={colors.textMuted} />
              <Text style={styles.errorText}>{i18n.t('target.hint.error')}</Text>
            </Pressable>
          ) : noData ? (
            <Text style={styles.errorText}>{i18n.t('target.hint.none')}</Text>
          ) : (
            <>
              {directors.length > 0 && (
                <>
                  <SectionLabel color={colors.gold} style={styles.hintLabel}>
                    {i18n.t('target.hint.director')}
                  </SectionLabel>
                  <View style={styles.directorRow}>
                    <Thumb poster={directors[0].poster} size={28} />
                    <Text
                      style={styles.directorName}
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.4}
                    >
                      {directors.map((d) => d.name).join(' · ')}
                    </Text>
                  </View>
                </>
              )}

              {cast.length > 0 && (
                <>
                  <SectionLabel
                    color={colors.gold}
                    style={StyleSheet.flatten([
                      styles.hintLabel,
                      directors.length > 0 && { marginTop: 14 },
                    ])}
                  >
                    {i18n.t('target.hint.topCast')}
                  </SectionLabel>
                  <View style={styles.castRow}>
                    {cast.map((c, i) => (
                      <View
                        key={`${c.name}-${i}`}
                        style={styles.castCell}
                        accessible
                        accessibilityLabel={i18n.t('target.hint.castMember', { name: c.name })}
                      >
                        <Thumb poster={c.poster} size={52} />
                        <Text
                          style={styles.castName}
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.3}
                        >
                          {firstName(c.name)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

// Layout-stable placeholders so nothing reflows when real data arrives.
function HintSkeleton() {
  return (
    <>
      <SectionLabel color={colors.gold} style={styles.hintLabel}>
        {i18n.t('target.hint.director')}
      </SectionLabel>
      <View style={styles.directorRow}>
        <View style={[styles.skelCircle, { width: 28, height: 28 }]} />
        <View style={[styles.skelBar, { width: 150 }]} />
      </View>
      <SectionLabel color={colors.gold} style={StyleSheet.flatten([styles.hintLabel, { marginTop: 14 }])}>
        {i18n.t('target.hint.topCast')}
      </SectionLabel>
      <View style={styles.castRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.castCell}>
            <View style={[styles.skelCircle, { width: 52, height: 52 }]} />
            <View style={[styles.skelBar, { width: 44, marginTop: 8 }]} />
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.card,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  headerText: { flex: 1, paddingRight: 40 },
  poster: {
    width: 50,
    height: 72,
    borderRadius: 5,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  posterImg: { width: 50, height: 72 },
  title: { color: colors.textPrimary, marginTop: 2, marginBottom: 3 },

  hintBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.goldTintBg,
    borderWidth: 1,
    borderColor: colors.goldKeyline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBtnActive: { borderColor: colors.gold },

  panel: { overflow: 'hidden' },
  divider: {
    height: 1,
    backgroundColor: colors.borderRow,
    marginVertical: 12,
  },
  hintLabel: { marginBottom: 8 },

  directorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  directorName: { flex: 1, fontFamily: fonts.display.medium, fontSize: 15, color: colors.textPrimary },

  castRow: { flexDirection: 'row', gap: 14 },
  castCell: { width: 56, alignItems: 'center' },
  castName: {
    marginTop: 6,
    fontFamily: fonts.text.medium,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  thumb: {
    borderRadius: radius.pill,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  errorText: { fontFamily: fonts.text.regular, fontSize: 12, color: colors.textSecondary },

  skelCircle: { borderRadius: radius.pill, backgroundColor: colors.surfaceRaised },
  skelBar: { height: 10, borderRadius: 5, backgroundColor: colors.borderRow },
});
