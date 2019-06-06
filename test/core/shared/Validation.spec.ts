import each from 'jest-each';
import MessageBus from '../../../src/core/shared/MessageBus';
import Validation from '../../../src/core/shared/Validation';
import Language from '../../../src/core/shared/Language';
import { StCodec } from '../../../src/core/classes/StCodec.class';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('isCharNumber()', () => {
  // then
  each([
    [new KeyboardEvent('keypress', { key: 'a' }), false],
    [new KeyboardEvent('keypress', { key: '0' }), true],
    [new KeyboardEvent('keypress', { key: '"' }), false],
    [new KeyboardEvent('keypress', { key: 'Shift' }), false]
  ]).test('Validation.isCharNumber', (event: KeyboardEvent, expected: any) => {
    expect(Validation.isCharNumber(event)).toBe(expected);
  });
});

// given
describe('getValidationMessage()', () => {
  // then
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

    // @ts-ignore
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

    // @ts-ignore
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

    // @ts-ignore
    expect(instance.getErrorData(errorData)).toEqual({
      field: errorData.errordata[0],
      errormessage: errorData.errormessage
    });
  });
});

// given
describe('setCustomValidationError()', () => {
  // when
  let element: HTMLInputElement;
  beforeEach(() => {
    element = document.createElement('input');
  });

  // then
  it('should have validity equal false if validation message is set', () => {
    Validation.setCustomValidationError(element, 'some error message');
    expect(element.checkValidity()).toEqual(false);
  });

  // then
  it('should have validity equal true if validation message is not set', () => {
    Validation.setCustomValidationError(element, '');
    expect(element.checkValidity()).toEqual(true);
  });
});

// given
describe('backendValidation()', () => {
  // when
  let element: HTMLInputElement;
  let messageElement: HTMLElement;
  let instance: Validation = new Validation();
  beforeEach(() => {
    element = document.createElement('input');
    messageElement = document.createElement('label');

    const messageBusEvent = {
      type: MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
    };
    // @ts-ignore
    instance._messageBus.publish(messageBusEvent);
  });

  // then
  it('checkBackendValidity', () => {
    // const spy = jest.spyOn(instance, 'checkBackendValidity');
    // const spy2 = jest.spyOn(instance, 'validate');
    // instance.backendValidation(element, messageElement, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
    // expect(spy).toHaveBeenCalled();
  });

  // then
  it('validate', () => {});
});

// given
describe('checkBackendValidity()', () => {
  let instance: Validation = new Validation();
  // then
  it('should trigger setError function', () => {
    const spy = jest.spyOn(instance, 'setError');
    const data = {
      field: 'pan',
      message: 'some message'
    };
    let element = document.createElement('input');
    let messageElement = document.createElement('label');
    instance.checkBackendValidity(data, element, messageElement);
    expect(spy).toHaveBeenCalled();
  });
});
