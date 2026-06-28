import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { colors, fonts, spacing } from '../../theme';

const SECTIONS = [
  {
    title: 'Data Collection',
    body: 'Kinochain does not require an account, create user profiles, or store personal data in an application database.',
  },
  {
    title: 'Network Requests',
    body: 'To provide gameplay, the app contacts the Kinochain API hosted by Cloudflare. Cloudflare processes the device IP address and technical request data to deliver and protect the service. Kinochain does not keep persistent application request logs. The API sends movie and person identifiers and filters to TMDB; the user\'s IP address is not sent to TMDB.',
  },
  {
    title: 'Analytics & Tracking',
    body: 'Kinochain does not include analytics, crash-reporting, advertising, or tracking SDKs and does not use request information for advertising or tracking.',
  },
  {
    title: 'Local Storage',
    body: 'The app stores a small onboarding flag on your device to remember whether you have completed the tutorial. This data never leaves your device.',
  },
  {
    title: 'Cloudflare',
    body: 'Cloudflare provides network delivery, short-lived abuse prevention, and serverless processing. Read the ',
    link: {
      label: 'Cloudflare privacy policy.',
      url: 'https://www.cloudflare.com/privacypolicy/',
    },
  },
  {
    title: 'The Movie Database',
    body: 'Movie data and images are provided by TMDB. Read the ',
    link: {
      label: 'TMDB privacy policy.',
      url: 'https://www.themoviedb.org/privacy-policy',
    },
  },
  {
    title: 'Retention & Deletion',
    body: 'Kinochain does not retain personal data or persistent request logs. A salted, one-way representation of the device IP may be used briefly for rate limiting. Cached responses contain only public TMDB data. Delete the app to remove its local onboarding preference.',
  },
  {
    title: 'Contact',
    body: 'If you have questions about this privacy policy, contact us at info@rightword.be.',
  },
];

export default function PrivacyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.navTitle} maxFontSizeMultiplier={1.5}>Privacy Policy</Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated} maxFontSizeMultiplier={1.5}>Last updated: June 2026</Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>{s.title}</Text>
            <Text style={styles.sectionBody} maxFontSizeMultiplier={1.5}>
              {s.body}
              {'link' in s && s.link ? (
                <Text
                  style={styles.link}
                  maxFontSizeMultiplier={1.5}
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(s.link.url)}
                >
                  {s.link.label}
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
