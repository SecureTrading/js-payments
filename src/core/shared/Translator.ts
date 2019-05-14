import i18next from 'i18next';
import de_DE from '../translations/de_DE';
import en_GB from '../translations/en_GB';
import fr_FR from '../translations/fr_FR';

// TODO docstring - class to act as adapter in case we ever change out the translator mechanism
export class Translator {
  constructor(locale: string) {
    i18next.init({
      debug: false,
      lng: locale,
      resources: {
        de_DE: { translation: de_DE },
        en_GB: { translation: en_GB },
        fr_FR: { translation: fr_FR }
      }
    });
  }

  public translate = (text: string) => i18next.t(text);
}
