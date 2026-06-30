import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { colors, fonts, spacing } from '../../theme';
import i18n, { useLocale } from '../i18n/i18n';

type Section = {
  titleKey: string;
  bodyKey: string;
  link?: { labelKey: string; url: string };
};

const SECTIONS: Section[] = [
  { titleKey: 'privacy.dataCollection', bodyKey: 'privacy.dataCollectionBody' },
  { titleKey: 'privacy.networkRequests', bodyKey: 'privacy.networkRequestsBody' },
  { titleKey: 'privacy.analytics', bodyKey: 'privacy.analyticsBody' },
  { titleKey: 'privacy.localStorage', bodyKey: 'privacy.localStorageBody' },
  {
    titleKey: 'privacy.tmdb',
    bodyKey: 'privacy.tmdbBody',
    link: { labelKey: 'privacy.tmdbPolicyLink', url: 'https://www.themoviedb.org/privacy-policy' },
  },
  { titleKey: 'privacy.retention', bodyKey: 'privacy.retentionBody' },
  { titleKey: 'privacy.contact', bodyKey: 'privacy.contactBody' },
];

export default function PrivacyScreen() {
  useLocale();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('privacy.goBack')}
        >
          <Icon name="back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.navTitle} maxFontSizeMultiplier={1.5}>{i18n.t('privacy.title')}</Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated} maxFontSizeMultiplier={1.5}>{i18n.t('privacy.lastUpdated')}</Text>

        {SECTIONS.map((s) => (
          <View key={s.titleKey} style={styles.section}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>{i18n.t(s.titleKey)}</Text>
            <Text style={styles.sectionBody} maxFontSizeMultiplier={1.5}>
              {i18n.t(s.bodyKey)}
              {s.link ? (
                <Text
                  style={styles.link}
                  maxFontSizeMultiplier={1.5}
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(s.link!.url)}
                >
                  {i18n.t(s.link.labelKey)}
                </Text>
              ) : null}
            </Text>
          </View>
        ))}
      </ScrollView>
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
  updated: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 20,
  },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontFamily: fonts.display.semibold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sectionBody: {
    fontFamily: fonts.text.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  link: { color: colors.goldBright, textDecorationLine: 'underline' },
});
