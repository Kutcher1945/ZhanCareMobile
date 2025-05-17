// utils/i18n.ts
import kz from '@/locales/kz';
import ru from '@/locales/ru';

type Locale = 'ru' | 'kz';

type Translations = {
  ru: typeof ru;
  kz: typeof kz;
};

const i18n = {
  translations: {
    ru,
    kz,
  } as Translations,

  locale: 'ru' as Locale,
  defaultLocale: 'ru' as Locale,
  fallbacks: true,

  t: (key: keyof typeof ru): string => {
    const dict = i18n.translations[i18n.locale];
    return dict[key] ?? key;
  },
};

export default i18n;
