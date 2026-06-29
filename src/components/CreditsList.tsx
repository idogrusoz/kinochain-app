import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { colors, radius, type } from '../../theme';
import { Credit } from '../../types';
import { Icon } from './ui/Icon';
import i18n from '../i18n/i18n';

const Row = React.memo(
  ({ credit, onSelect, highlighted }: { credit: Credit; onSelect: (id: number) => void; highlighted?: boolean }) => {
    const secondary = [
      credit.name,
      credit.releaseDate ? credit.releaseDate.split('-')[0] : null,
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <TouchableOpacity
        onPress={() => onSelect(credit.titleId)}
        style={[styles.row, highlighted && styles.highlightedRow]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={[credit.title, secondary].filter(Boolean).join(', ')}
        accessibilityHint={i18n.t('credits.a11yHint')}
      >
        {credit.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w185${credit.poster_path}` }}
            style={styles.thumb}
          />
        ) : (
          <View style={[styles.thumb, styles.placeholder]}>
            <Icon name="film" size={14} color={colors.textMuted} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[type.listTitle, { color: colors.textPrimary }]} numberOfLines={1} maxFontSizeMultiplier={1.5}>
            {credit.title}
          </Text>
          {!!secondary && (
            <Text
              style={[
                type.secondary,
                {
                  color: credit.isDirector ? colors.gold : colors.textSecondary,
                  marginTop: 2,
                },
              ]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.5}
            >
              {secondary}
            </Text>
          )}
        </View>
        <Icon name="forward" size={18} color={colors.gold} />
      </TouchableOpacity>
    );
  }
);

export function CreditsList({
  credits,
  onSelectCredit,
  highlightId,
}: {
  credits: Credit[];
  onSelectCredit: (creditId: number) => void;
  highlightId?: number;
}) {
  const ref = useRef<FlatList<Credit>>(null);

  useEffect(() => {
    ref.current?.scrollToOffset({ offset: 0, animated: false });
  }, [credits]);

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={ref}
        data={credits}
        keyExtractor={(c) => String(c.titleId)}
        renderItem={({ item }) => (
          <Row credit={item} onSelect={onSelectCredit} highlighted={highlightId === item.titleId} />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        showsVerticalScrollIndicator={false}
        windowSize={7}
        initialNumToRender={12}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  thumb: { width: 34, height: 48, borderRadius: 4, backgroundColor: '#222' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  sep: { height: 1, backgroundColor: colors.borderRow, marginLeft: 59 },
  highlightedRow: {
    backgroundColor: '#1C160A',
    borderRadius: 8,
  },
});
