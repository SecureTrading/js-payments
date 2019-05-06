import i18next from 'i18next';
import de from '../translations/de/translation';
import en from '../translations/en/translation';
import fr from '../translations/fr/translation';

// TODO docstring - class to act as adapter in case we ever change out the translator mechanism
export class Translator {
  constructor(locale: string) {
    i18next.init({
      debug: false,
      lng: locale,
      resources: {
        de_DE: { translation: de },
        en_EN: { translation: en },
        fr_FR: { translation: fr }
      }
    });
  }

  public translate(text: string) {
    return i18next.t(text);
  }
}
