import { useCallback, useReducer, useSyncExternalStore } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import nl from '../locales/nl.json';
import de from '../locales/de.json';
import tr from '../locales/tr.json';
import ru from '../locales/ru.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';
import ar from '../locales/ar.json';

const i18n = new I18n({ en, fr, nl, de, tr, ru, es, pt, ar });

i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Reactive locale store: i18n.t() is read at render time, so changing the
// locale must force every mounted screen to re-render. Components subscribe via
// useLocale(); setI18nLocale() updates the locale and notifies subscribers.
let localeVersion = 0;
const listeners = new Set<() => void>();

export function setI18nLocale(locale: string) {
  if (i18n.locale === locale) return;
  i18n.locale = locale;
  localeVersion += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Subscribes the calling component to locale changes, re-rendering it whenever
// the language switches. Call once near the top of any screen that shows text.
//
// useSyncExternalStore handles the focused screen. But the stack navigator keeps
// inactive screens mounted and react-native-screens freezes them, so a
// background screen (e.g. Welcome behind the About language picker) misses the
// store notification. We additionally force a re-render whenever the screen
// regains focus, so it always reflects the current locale when shown.
export function useLocale() {
  const version = useSyncExternalStore(
    subscribe,
    () => localeVersion,
    () => localeVersion
  );
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  useFocusEffect(
    useCallback(() => {
      forceRender();
    }, [])
  );
  return version;
}

export default i18n;
