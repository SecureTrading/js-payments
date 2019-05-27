import each from 'jest-each';
import Validation from '../../../src/core/shared/Validation';
import Language from '../../../src/core/shared/Language';

each([
  [new KeyboardEvent('keypress', { key: 'a' }), false],
  [new KeyboardEvent('keypress', { key: '0' }), true],
  [new KeyboardEvent('keypress', { key: '"' }), false],
  [new KeyboardEvent('keypress', { key: 'Shift' }), false]
]).test('Validation.isCharNumber', (event: KeyboardEvent, expected: any) => {
  expect(Validation.isCharNumber(event)).toBe(expected);
});

each([
  [{ value: '123', length: 1 }, '3'],
  [{ value: '123', length: 2 }, '23'],
  [{ value: '123', length: 4 }, '123']
]).test('Validation.getLastNChars', (data, expected) => {
  expect(Validation.getLastNChars(data.value, data.length)).toBe(expected);
});

each([
  [{ valid: true, valueMissing: false }, ''],
  [{ valid: false, valueMissing: true }, Language.translations.VALIDATION_ERROR],
  [{ valid: false, patternMismatch: true }, Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH],
  [{ valid: false, tooShort: true }, Language.translations.VALIDATION_ERROR_VALUE_TOO_SHORT]
]).test('Validation.getValidationMessage', (validityState, expected) => {
  const instance = new Validation();
  expect(instance.getValidationMessage(validityState)).toBe(expected);
});
