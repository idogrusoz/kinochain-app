import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import Mark from '../../assets/kinochain-mark.svg';
import TmdbLogo from '../../assets/tmdb-logo.svg';
import { Wordmark } from '../components/ui/Wordmark';
import { Icon } from '../components/ui/Icon';
import { Surface } from '../components/ui/Surface';
import { OutlineButton } from '../components/ui/OutlineButton';
import { colors, fonts, spacing, radius } from '../../theme';
import i18n from '../i18n/i18n';

const APP_VERSION = '1.0.0';
export default function AboutScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('about.goBack')}
        >
          <Icon name="back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.navTitle} maxFontSizeMultiplier={1.5}>{i18n.t('about.title')}</Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Mark width={48} height={48} />
          <Wordmark size={18} />
          <Text style={styles.version} maxFontSizeMultiplier={1.5}>{i18n.t('about.version', { version: APP_VERSION })}</Text>
        </View>

        <Surface style={styles.card}>
          <View style={styles.tmdbRow}>
            <TmdbLogo width={80} height={34} />
          </View>
          <Text style={styles.cardBody} maxFontSizeMultiplier={1.5}>
            {i18n.t('about.tmdbDisclaimer')}
          </Text>
        </Surface>

        <View style={styles.links}>
          <LinkRow
            label={i18n.t('about.privacyPolicy')}
            icon="info"
            onPress={() => navigation.navigate('Privacy')}
          />
          <View style={styles.separator} />
          <LinkRow
            label={i18n.t('about.howToPlay')}
            icon="help"
            onPress={() => navigation.navigate('Onboarding')}
          />
          <View style={styles.separator} />
          <LinkRow
            label={i18n.t('about.tmdbWebsite')}
            icon="film"
            onPress={() => Linking.openURL('https://www.themoviedb.org')}
          />
        </View>

        <Text style={styles.credit} maxFontSizeMultiplier={1.5}>
          {i18n.t('about.madeBy')}
        </Text>
      </ScrollView>
    </View>
  );
}

function LinkRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: 'info' | 'help' | 'film';
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.linkRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={18} color={colors.gold} />
      <Text style={styles.linkLabel} maxFontSizeMultiplier={1.5}>{label}</Text>
      <Icon name="forward" size={16} color={colors.textSecondary} />
    </Pressable>
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
  hero: { alignItems: 'center', gap: 8, paddingTop: 16, paddingBottom: 28 },
  version: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: { padding: 18 },
  tmdbRow: { alignItems: 'center', marginBottom: 14 },
  cardBody: {
    fontFamily: fonts.text.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  links: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  linkLabel: {
    flex: 1,
    fontFamily: fonts.text.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  separator: { height: 1, backgroundColor: colors.borderRow, marginHorizontal: 16 },
  credit: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
