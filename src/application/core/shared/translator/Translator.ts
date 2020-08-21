import i18next from 'i18next';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
// @ts-ignore
import cy_GB from '../../../../translations/json/cy_GB.json';
// @ts-ignore
import da_DK from '../../../../translations/json/da_DK.json';
// @ts-ignore
import de_DE from '../../../../translations/json/de_DE.json';
// @ts-ignore
import en_GB from '../../../../translations/json/en_GB.json';
// @ts-ignore
import en_US from '../../../../translations/json/en_US.json';
// @ts-ignore
import es_ES from '../../../../translations/json/es_ES.json';
// @ts-ignore
import fr_FR from '../../../../translations/json/fr_FR.json';
// @ts-ignore
import nl_NL from '../../../../translations/json/nl_NL.json';
// @ts-ignore
import no_NO from '../../../../translations/json/no_NO.json';
// @ts-ignore
import sv_SE from '../../../../translations/json/sv_SE.json';
import { Container } from 'typedi';

export class Translator {
  private _storage: BrowserLocalStorage = Container.get(BrowserLocalStorage);

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

  public translate = (text: string) => {
    let json: object;

    try {
      const translations: string = this._storage.getItem('merchantTranslations');
      json = translations ? JSON.parse(translations) : {};
    } catch (e) {
      json = {};
    }

    // @ts-ignore
    const translation: string = Object.keys(json).includes(text) ? json[text] : '';
    return translation ? translation : i18next.t(text, { content: text });
  };
}
