import i18next from 'i18next';

// TODO docstring - class to act as adapter in case we ever change out the translator mechanism
export class Translator {
  private _locale: string;

  constructor(locale: string) {
    locale = locale ? locale : 'en-GB';
    i18next.init({
      lng: locale,
      debug: false,
      resources: {
        de: { translation: require('../translations/de.po') },
        fr: { translation: require('../translations/fr.po') }
      }
    });
  }

  public translate(text: string) {
    return i18next.t(text);
  }
}
