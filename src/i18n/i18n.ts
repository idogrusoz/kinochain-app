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

export default i18n;
