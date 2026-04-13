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
 * i18next is initialised synchronously at **module load time**, not inside
 * a useEffect. Two reasons:
 *
 *   1. Every screen calls `useTranslation` during its very first render.
 *      If i18next isn't initialised yet, react-i18next either returns a
 *      broken `t` or — with Suspense enabled — throws a Promise that the
 *      React 19 scheduler has nowhere to catch, which presents as a blank
 *      screen in Expo Go.
 *   2. This module has no side effects other than calling `i18n.init`,
 *      which is safe to run in both iOS and Android JS environments at
 *      bundle load time.
 *
 * We also explicitly set `useSuspense: false` so the first render never
 * throws a Promise even if i18n is somehow re-initialised later.
 */

function detectLanguage(): string {
  try {
    return Localization.getLocales()[0]?.languageCode ?? 'en';
  } catch {
    return 'en';
  }
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
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
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

/** Optional runtime language switch used by the settings screen. */
export function setLanguage(lang: string | null): void {
  if (lang && lang !== i18n.language) {
    i18n.changeLanguage(lang).catch(() => {});
  }
}

export default i18n;
