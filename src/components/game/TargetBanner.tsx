import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius, type } from '../../../theme';
import { Icon } from '../ui/Icon';
import { SectionLabel } from '../ui/SectionLabel';
import { tmdbImageUrl } from '../../services/tmdb/client';

// The persistent, dominant goal: reach this film.
export function TargetBanner({
  title,
  year,
  poster,
}: {
  title: string;
  year: string;
  poster: string | null;
}) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Target: ${title}${year ? ` (${year})` : ''}`}
    >
      <View style={styles.poster}>
        {poster ? (
          <Image
            source={{ uri: tmdbImageUrl(poster) }}
            style={styles.posterImg}
          />
        ) : (
          <Icon name="film" size={20} color={colors.gold} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <SectionLabel color={colors.gold}>Target</SectionLabel>
        <Text style={[type.titleHero, styles.title]} numberOfLines={1} maxFontSizeMultiplier={1.5}>
          {title}
        </Text>
        {!!year && (
          <Text style={[type.secondary, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>{year}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.card,
    padding: 12,
  },
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
});
