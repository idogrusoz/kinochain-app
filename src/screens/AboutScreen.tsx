import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Switch, Modal } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import Mark from '../../assets/kinochain-mark.svg';
import TmdbLogo from '../../assets/tmdb-logo.svg';
import { Wordmark } from '../components/ui/Wordmark';
import { Icon } from '../components/ui/Icon';
import { Surface } from '../components/ui/Surface';
import { colors, fonts, spacing, radius } from '../../theme';
import i18n from '../i18n/i18n';
import {
  getHapticsEnabled,
  setHapticsEnabled,
  getLocale,
  setLocale,
} from '../services/settings';

const APP_VERSION = '1.0.0';

const LANGUAGES: { code: string | null; label: string }[] = [
  { code: null, label: 'systemDefault' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'de', label: 'Deutsch' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
];

export default function AboutScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [haptics, setHaptics] = useState(getHapticsEnabled());
  const [langPickerVisible, setLangPickerVisible] = useState(false);
  const [, forceUpdate] = useState(0);

  const toggleHaptics = useCallback((val: boolean) => {
    setHaptics(val);
    setHapticsEnabled(val);
  }, []);

  const pickLanguage = useCallback(async (code: string | null) => {
    await setLocale(code);
    setLangPickerVisible(false);
    forceUpdate((n) => n + 1);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === getLocale())?.label
    ?? LANGUAGES.find((l) => l.code === null)?.label;

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

        {/* Settings section */}
        <Text style={styles.sectionHeader} maxFontSizeMultiplier={1.5}>{i18n.t('settings.title')}</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel} maxFontSizeMultiplier={1.5}>{i18n.t('settings.haptics')}</Text>
            <Switch
              value={haptics}
              onValueChange={toggleHaptics}
              trackColor={{ false: colors.border, true: colors.gold }}
              thumbColor={colors.textPrimary}
              accessibilityLabel={i18n.t('settings.haptics')}
            />
          </View>
          <View style={styles.separator} />
          <Pressable
            style={styles.settingRow}
            onPress={() => setLangPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('settings.language')}
          >
            <Text style={styles.settingLabel} maxFontSizeMultiplier={1.5}>{i18n.t('settings.language')}</Text>
            <View style={styles.langValue}>
              <Text style={styles.settingValue} maxFontSizeMultiplier={1.5} numberOfLines={1}>
                {currentLang === 'systemDefault' ? i18n.t('settings.systemDefault') : currentLang}
              </Text>
              <Icon name="forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* TMDB card */}
        <Surface style={styles.card}>
          <View style={styles.tmdbRow}>
            <TmdbLogo width={80} height={34} />
          </View>
          <Text style={styles.cardBody} maxFontSizeMultiplier={1.5}>
            {i18n.t('about.tmdbDisclaimer')}
          </Text>
        </Surface>

        {/* Links */}
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

      {/* Language picker modal */}
      <Modal visible={langPickerVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setLangPickerVisible(false)}>
          <Pressable style={styles.picker} onPress={() => {}}>
            <Text style={styles.pickerTitle} maxFontSizeMultiplier={1.5}>{i18n.t('settings.language')}</Text>
            {LANGUAGES.map((lang) => {
              const selected = lang.code === null
                ? !LANGUAGES.slice(1).some((l) => l.code === getLocale())
                : lang.code === getLocale();
              return (
                <Pressable
                  key={lang.code ?? 'system'}
                  style={styles.pickerRow}
                  onPress={() => pickLanguage(lang.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <Text
                    style={[styles.pickerLabel, selected && styles.pickerLabelSelected]}
                    maxFontSizeMultiplier={1.5}
                  >
                    {lang.label === 'systemDefault' ? i18n.t('settings.systemDefault') : lang.label}
                  </Text>
                  {selected && <Icon name="check" size={18} color={colors.gold} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
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
  hero: { alignItems: 'center', gap: 8, paddingTop: 16, paddingBottom: 24 },
  version: {
    fontFamily: fonts.text.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontFamily: fonts.text.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  settingLabel: {
    fontFamily: fonts.text.medium,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  langValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: {
    fontFamily: fonts.text.regular,
    fontSize: 14,
    color: colors.textSecondary,
    maxWidth: 140,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  picker: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  pickerTitle: {
    fontFamily: fonts.display.semibold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: 8,
  },
  pickerLabel: {
    fontFamily: fonts.text.regular,
    fontSize: 16,
    color: colors.textSoft,
  },
  pickerLabelSelected: {
    fontFamily: fonts.text.medium,
    color: colors.gold,
  },
});
