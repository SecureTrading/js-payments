import i18next from 'i18next';
// TypeScript has been set to import json it just warns about it in here
// @ts-ignore
import cy_GB from '../translations/cy_GB.json';
// @ts-ignore
import da_DK from '../translations/da_DK.json';
// @ts-ignore
import de_DE from '../translations/de_DE.json';
// @ts-ignore
import en_GB from '../translations/en_GB.json';
// @ts-ignore
import en_US from '../translations/en_US.json';
// @ts-ignore
import es_ES from '../translations/es_ES.json';
// @ts-ignore
import fr_FR from '../translations/fr_FR.json';
// @ts-ignore
import nl_NL from '../translations/nl_NL.json';
// @ts-ignore
import no_NO from '../translations/no_NO.json';
// @ts-ignore
import sv_SE from '../translations/sv_SE.json';
import Utils from './Utils';

// TODO docstring - class to act as adapter in case we ever change out the translator mechanism
export class Translator {
  constructor(locale: string) {
    i18next.init({
      debug: false,
      lng: locale,
      resources: {
        cy_GB: { translation: cy_GB },
        da_DK: { translation: da_DK },
        de_DE: { translation: de_DE },
        en_GB: { translation: en_GB },
        en_US: { translation: en_US },
        es_ES: { translation: es_ES },
        fr_FR: { translation: fr_FR },
        nl_NL: { translation: nl_NL },
        no_NO: { translation: no_NO },
        sv_SE: { translation: sv_SE }
      }
    });
  }

  /**
   * Translates given text or gets it when it's defined by merchant in config.
   * @param text
   */
  public translate = (text: string) => {
    const translation = Utils.getLocalStorageItem(text, localStorage.merchantTranslations);
    return translation ? translation : i18next.t(text, { content: text });
  };
}
