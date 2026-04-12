import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../locales/ar.json';
import de from '../locales/de.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import hi from '../locales/hi.json';
import ja from '../locales/ja.json';
import pt from '../locales/pt.json';
import zh from '../locales/zh.json';

/**
 * Initialise i18next with all supported locales. Auto-detects the device
 * language; falls back to English.
 */
export function initI18n(overrideLanguage?: string | null): void {
  const device = Localization.getLocales()[0]?.languageCode ?? 'en';
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources: {
        ar: { translation: ar },
        de: { translation: de },
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        hi: { translation: hi },
        ja: { translation: ja },
        pt: { translation: pt },
        zh: { translation: zh },
      },
      lng: overrideLanguage ?? device,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
}

export default i18n;
