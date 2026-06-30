import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import i18n from '../i18n/i18n';

const KEYS = {
  haptics: 'kinochain.haptics',
  locale: 'kinochain.locale',
} as const;

let hapticsEnabled = true;

export async function loadSettings() {
  try {
    const [hapVal, locVal] = await Promise.all([
      AsyncStorage.getItem(KEYS.haptics),
      AsyncStorage.getItem(KEYS.locale),
    ]);
    hapticsEnabled = hapVal !== '0';
    if (locVal) {
      i18n.locale = locVal;
    }
  } catch {
    // defaults are fine
  }
}

export function getHapticsEnabled() {
  return hapticsEnabled;
}

export async function setHapticsEnabled(on: boolean) {
  hapticsEnabled = on;
  await AsyncStorage.setItem(KEYS.haptics, on ? '1' : '0').catch(() => {});
}

export async function setLocale(code: string | null) {
  if (code) {
    i18n.locale = code;
    await AsyncStorage.setItem(KEYS.locale, code).catch(() => {});
  } else {
    const { getLocales } = await import('expo-localization');
    i18n.locale = getLocales()[0]?.languageCode ?? 'en';
    await AsyncStorage.removeItem(KEYS.locale).catch(() => {});
  }
}

export function getLocale(): string {
  return i18n.locale;
}

// Guarded haptic helpers
export function hapticLight() {
  if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticMedium() {
  if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function hapticSuccess() {
  if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
