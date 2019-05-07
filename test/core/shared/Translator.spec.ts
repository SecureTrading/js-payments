import { Translator } from '../../../src/core/shared/Translator';

describe('translate()', () => {
  it('should leave english unchanged', () => {
    let translator = new Translator('en_GB');
    expect(translator.translate('Field is required')).toBe('Field is required');
    expect(translator.translate('Ok')).toBe('Payment successful'); // Special case for success message
  });

  it('should translate to french', () => {
    let translator = new Translator('fr_FR');
    expect(translator.translate('Field is required')).toBe('Champ requis');
    expect(translator.translate('Ok')).toBe('Paiement terminé');
  });

  it('should translate to german', () => {
    let translator = new Translator('de_DE');
    expect(translator.translate('Field is required')).toBe('Feld ist erforderlich');
    expect(translator.translate('Ok')).toBe('Zahlung abgeschlossen');
  });
});
