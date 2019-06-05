import each from 'jest-each';
import Validation from '../../../src/core/shared/Validation';
import Language from '../../../src/core/shared/Language';
import { StCodec } from '../../../src/core/classes/StCodec.class';

jest.mock('./../../../src/core/shared/MessageBus');

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
  [{ valid: false, valueMissing: true }, Language.translations.VALIDATION_ERROR_FIELD_IS_REQUIRED],
  [{ valid: false, patternMismatch: true }, Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH],
  [{ valid: false, customError: true }, Language.translations.VALIDATION_ERROR],
  [{ valid: false, tooShort: true }, Language.translations.VALIDATION_ERROR]
]).test('Validation.getValidationMessage', (validityState, expected) => {
  // @ts-ignore
  expect(Validation.getValidationMessage(validityState)).toBe(expected);
});

// given
describe('isEnter()', () => {
  const keyCodeForOther = 71;
  const keyCodeForEnter = 13;
  // @ts-ignore
  const eventWithEnter = new KeyboardEvent('keypress', { keyCode: keyCodeForEnter });
  // @ts-ignore
  const eventWithOther = new KeyboardEvent('keypress', { keyCode: keyCodeForOther });
  // then
  it(`should return true if indicated keyCode is equal ${keyCodeForEnter}`, () => {
    expect(Validation.isEnter(eventWithEnter)).toEqual(true);
  });

  // then
  it(`should return false if indicated keyCode ${keyCodeForOther} is not equal ${keyCodeForEnter}`, () => {
    expect(Validation.isEnter(eventWithOther)).toEqual(false);
  });
});

// given
describe('blockForm()', () => {
  const instance = new Validation();
  // then
  it('should return state of blocking action', () => {
    expect(instance.blockForm(true)).toBe(true);
  });

  // then
  it('should return state of blocking action', () => {
    expect(instance.blockForm(false)).toBe(false);
  });
});

// given
describe('getErrorData()', () => {
  // then
  it('should return state of blocking action', () => {
    const instance = new Validation();
    const errorData = {
      errordata: ['pan'],
      errormessage: 'Invalid field'
    };
    const data = StCodec.getErrorData(errorData);

    expect(instance.getErrorData(errorData)).toEqual({
      field: errorData.errordata[0],
      errormessage: errorData.errormessage
    });
  });

  // then
  it('should return state of blocking action', () => {
    const instance = new Validation();
    const errorData = {
      errordata: ['expirydate'],
      errormessage: 'Invalid field'
    };
    const data = StCodec.getErrorData(errorData);

    expect(instance.getErrorData(errorData)).toEqual({
      field: errorData.errordata[0],
      errormessage: errorData.errormessage
    });
  });

  // then
  it('should return state of blocking action', () => {
    const instance = new Validation();
    const errorData = {
      errordata: ['securitycode'],
      errormessage: 'Invalid field'
    };
    const data = StCodec.getErrorData(errorData);

    expect(instance.getErrorData(errorData)).toEqual({
      field: errorData.errordata[0],
      errormessage: errorData.errormessage
    });
  });
});
