declare module 'i18n-js' {
  export let translations: { [key: string]: any };
  export let locale: string;
  export let defaultLocale: string;
  export let fallbacks: boolean;
  export function t(scope: string, options?: any): string;
}
