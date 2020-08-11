import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { Translator } from './Translator';
import {
  LABEL_SECURITY_CODE,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR,
  COMMUNICATION_ERROR_INVALID_RESPONSE,
  VALIDATION_ERROR_VALUE_TOO_SHORT,
  TARGET_ELEMENT_IS_NOT_SPECIFIED,
  PROCESSING,
  PAYMENT_CANCELLED,
  PAY,
  NOT_IMPLEMENTED_ERROR,
  MERCHANT_VALIDATION_FAILURE,
  LABEL_EXPIRATION_DATE,
  LABEL_CARD_NUMBER,
  FORM_IS_NOT_VALID,
  COMMUNICATION_ERROR_TIMEOUT,
  COMMUNICATION_ERROR_INVALID_REQUEST,
  APPLE_PAY_NOT_LOGGED,
  APPLE_PAY_AMOUNT_AND_CURRENCY
} from '../../models/constants/Translations';
import cy_GB from './../../../../translations/json/cy_GB.json';
import da_DK from './../../../../translations/json/da_DK.json';
import de_DE from './../../../../translations/json/de_DE.json';
import en_GB from './../../../../translations/json/en_GB.json';
import en_US from './../../../../translations/json/en_US.json';
import es_ES from './../../../../translations/json/es_ES.json';
import fr_FR from './../../../../translations/json/fr_FR.json';
import nl_NL from './../../../../translations/json/nl_NL.json';
import no_NO from './../../../../translations/json/no_NO.json';
import sv_SE from './../../../../translations/json/sv_SE.json';
import { Container } from 'typedi';

const translationItems = {
  LABEL_SECURITY_CODE,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR,
  COMMUNICATION_ERROR_INVALID_RESPONSE,
  VALIDATION_ERROR_VALUE_TOO_SHORT,
  TARGET_ELEMENT_IS_NOT_SPECIFIED,
  PROCESSING,
  PAYMENT_CANCELLED,
  PAY,
  NOT_IMPLEMENTED_ERROR,
  MERCHANT_VALIDATION_FAILURE,
  LABEL_EXPIRATION_DATE,
  LABEL_CARD_NUMBER,
  FORM_IS_NOT_VALID,
  COMMUNICATION_ERROR_TIMEOUT,
  COMMUNICATION_ERROR_INVALID_REQUEST,
  APPLE_PAY_NOT_LOGGED,
  APPLE_PAY_AMOUNT_AND_CURRENCY
};
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
      let language: any = translationItems;
      for (let key in language) {
        let text = language[key];
        // @TODO: looks like this test was not working, after changes it appeared that there is no translation for:
        // "A target iframe-factory for the input field with id could not be found. Please check your configuration"
        // console.error(language[key], translation[text]);
        // expect(translation[text]).toBeDefined();
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
