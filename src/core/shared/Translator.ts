import i18next from 'i18next';
import de from '../translations/de/translation';
import en from '../translations/en/translation';
import fr from '../translations/fr/translation';

// TODO docstring - class to act as adapter in case we ever change out the translator mechanism
export class Translator {
  private _locale: string;

  constructor(locale: string) {
    locale = locale ? locale : 'en-GB';
    i18next.init({
      lng: locale,
      debug: false,
      resources: {
        de: { translation: de },
        en: { translation: en },
        fr: { translation: fr }
      }
    });
  }

  public translate(text: string) {
    return i18next.t(text);
  }
}
