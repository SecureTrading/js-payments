import { Translator } from '../../../src/core/shared/Translator';
import Language from '../../../src/core/shared/Language';
import de_DE from '../../../src/core/translations/de_DE';
import en_GB from '../../../src/core/translations/en_GB';
import fr_FR from '../../../src/core/translations/fr_FR';

describe('translate()', () => {
  it('should leave english unchanged', () => {
    let translator = new Translator('en_GB');
    expect(translator.translate('Field is required')).toBe('Field is required');
    expect(translator.translate('Ok')).toBe('Payment has been successfully processed'); // Special case for success message
  });

  it('should translate to french', () => {
    let translator = new Translator('fr_FR');
    expect(translator.translate('Field is required')).toBe('Champ requis');
    expect(translator.translate('Ok')).toBe('Le paiement a été traité avec succès');
  });

  it('should translate to german', () => {
    let translator = new Translator('de_DE');
    expect(translator.translate('Field is required')).toBe('Feld ist erforderlich');
    expect(translator.translate('Ok')).toBe('Zahlung wurde erfolgreich verarbeitet');
  });

  it('should have translations for all Language parameters', () => {
    let translations = [en_GB, fr_FR, de_DE];
    for (let i in translations) {
      let translation: any = translations[i];
      let language: any = Language.translations;
      for (let key in language) {
        let text = language[key];
        expect(translation[text]).toBeDefined();
      }
    }
  });
});
