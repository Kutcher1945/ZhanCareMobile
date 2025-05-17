import 'i18n-js';

declare module 'i18n-js' {
  interface ScopeMap {
    [key: string]: string | ScopeMap;
  }

  interface I18n {
    defaultLocale: string;
    locale: string;
    fallbacks: boolean;
    translations: ScopeMap;
    t(scope: string, options?: any): string;
  }

  const i18n: I18n;
  export = i18n;
}
