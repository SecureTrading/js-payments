import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Translator } from './Translator';
import { Language } from './Language';
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
import { Container } from 'typedi';

// given
describe('translate()', () => {
  //then
  it('should leave english unchanged', () => {
    let translator = new Translator('en_GB');
    expect(translator.translate('Field is required')).toBe('Field is required');
    expect(translator.translate('Ok')).toBe('Payment has been successfully processed'); // Special case for success message
  });

  // then
  it('should translate to french', () => {
    let translator = new Translator('fr_FR');
    expect(translator.translate('Field is required')).toBe('Champ requis');
    expect(translator.translate('Ok')).toBe('Le paiement a été traité avec succès');
  });

  // then
  it('should translate to german', () => {
    let translator = new Translator('de_DE');
    expect(translator.translate('Field is required')).toBe('Feld ist erforderlich');
    expect(translator.translate('Ok')).toBe('Zahlung wurde erfolgreich verarbeitet');
  });

  // then
  it('should have translations for all Language parameters', () => {
    let translations = [en_GB, cy_GB, da_DK, de_DE, en_US, es_ES, fr_FR, nl_NL, no_NO, sv_SE];
    for (let i in translations) {
      let translation: any = translations[i];
      let language: any = Language.translations;
      for (let key in language) {
        let text = language[key];
        expect(translation[text]).toBeDefined();
      }
    }
  });

  // then
  it('should return translation from local storage if its specified there', () => {
    const toTranslate = 'to translate';
    const translation: string = 'some random translation';
    const storage: BrowserLocalStorage = Container.get(BrowserLocalStorage);
    storage.getItem = jest.fn().mockReturnValueOnce(`{"${toTranslate}": "${translation}"}`);
    let instance: Translator = new Translator('en_GB');
    expect(instance.translate(toTranslate)).toEqual(translation);
  });
});
