import each from 'jest-each';
import MessageBus from '../../../src/core/shared/MessageBus';
import Validation from '../../../src/core/shared/Validation';
import Language from '../../../src/core/shared/Language';
import { StCodec } from '../../../src/core/classes/StCodec.class';

jest.mock('./../../../src/core/shared/MessageBus');

describe('Validation', () => {
  // given
  describe('isCharNumber()', () => {
    // when
    const { isCharNumberTestCases } = validationFixture();

    // then
    each(isCharNumberTestCases).test('Validation.isCharNumber', (event: KeyboardEvent, expected: any) => {
      expect(Validation.isCharNumber(event)).toBe(expected);
    });
  });

  // given
  describe('getValidationMessage()', () => {
    const { getValidationMessagesTestCases } = validationFixture();
    // then
    each(getValidationMessagesTestCases).test('Validation.getValidationMessage', (validityState, expected) => {
      // @ts-ignore
      expect(Validation.getValidationMessage(validityState)).toBe(expected);
    });
  });

  // given
  describe('isEnter()', () => {
    const { keyCodeForOther, keyCodeForEnter, eventWithOther, eventWithEnter } = validationFixture();
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
    const { instance } = validationFixture();
    // then
    it('should return state of blocking action equals true if MessageBus event data is true', () => {
      expect(instance.blockForm(true)).toBe(true);
    });

    // then
    it('should return state of blocking action equals false if MessageBus event data is false', () => {
      expect(instance.blockForm(false)).toBe(false);
    });
  });

  // given
  describe('getErrorData()', () => {
    // when
    const {
      instance,
      cardNumberErrorData,
      securityCodeErrorData,
      expirationDateErrorData,
      merchantInputsErrorData
    } = validationFixture();

    // then
    it('should pass error data with proper field equals pan ', () => {
      StCodec.getErrorData(cardNumberErrorData);
      // @ts-ignore
      expect(instance.getErrorData(cardNumberErrorData)).toEqual({
        field: cardNumberErrorData.errordata[0],
        errormessage: cardNumberErrorData.errormessage
      });
    });

    // then
    it('should pass error data with proper field equals security code ', () => {
      StCodec.getErrorData(securityCodeErrorData);
      // @ts-ignore
      expect(instance.getErrorData(securityCodeErrorData)).toEqual({
        field: securityCodeErrorData.errordata[0],
        errormessage: securityCodeErrorData.errormessage
      });
    });

    // then
    it('should pass error data with proper field equals expiration date ', () => {
      StCodec.getErrorData(expirationDateErrorData);
      // @ts-ignore
      expect(instance.getErrorData(expirationDateErrorData)).toEqual({
        field: expirationDateErrorData.errordata[0],
        errormessage: expirationDateErrorData.errormessage
      });
    });

    // then
    it('should pass error data with proper field equals merchant field', () => {
      StCodec.getErrorData(merchantInputsErrorData);
      // @ts-ignore
      expect(instance.getErrorData(merchantInputsErrorData)).toEqual({
        field: merchantInputsErrorData.errordata[0],
        errormessage: merchantInputsErrorData.errormessage
      });
    });
  });

  // given
  describe('setCustomValidationError()', () => {
    // when
    const { inputElement, someRandomMessage } = validationFixture();

    // then
    it('should have validity equal false if validation message is set', () => {
      Validation.setCustomValidationError(inputElement, someRandomMessage);
      expect(inputElement.checkValidity()).toEqual(false);
    });

    // then
    it('should have validity equal true if validation message is not set', () => {
      Validation.setCustomValidationError(inputElement, '');
      expect(inputElement.checkValidity()).toEqual(true);
    });
  });

  // given
  describe('backendValidation()', () => {
    // when
    const { instance, inputElement, messageElement } = validationFixture();

    // then
    it('should call checkBackendValidity()', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback({ field: 'some-id', message: 'some random message' });
      });
      const spy = jest.spyOn(instance, 'checkBackendValidity');
      instance.backendValidation(inputElement, messageElement, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('checkBackendValidity()', () => {
    const { instance, inputElement, messageElement, backendValidityData } = validationFixture();
    // then
    it('should trigger setError function', () => {
      const spy = jest.spyOn(instance, 'setError');
      instance.checkBackendValidity(backendValidityData, inputElement, messageElement);
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('_toggleErrorClass()', () => {
    const { instance, inputElement } = validationFixture();
    // then
    it('should remove error class if field is valid', () => {
      inputElement.setCustomValidity('');
      // @ts-ignore
      instance._toggleErrorClass(inputElement);
      expect(inputElement.classList.contains(Validation.ERROR_FIELD_CLASS)).toEqual(false);
    });

    // then
    it('should add error class if field is invalid', () => {
      inputElement.setCustomValidity('some error');
      // @ts-ignore
      instance._toggleErrorClass(inputElement);
      expect(inputElement.classList.contains(Validation.ERROR_FIELD_CLASS)).toEqual(true);
    });
  });

  // given
  describe('_getProperTranslation()', () => {
    const { instance, inputElement, messageElement, someRandomMessage } = validationFixture();
    const customErrorMessage = 'Some message';
    const isCardNumberInput = true;
    const isNotCardNumberInput = false;
    // then
    it(`should return '${customErrorMessage}' when it's not card number input and has messageElement and customErrorMessage defined`, () => {
      expect(
        // @ts-ignore
        instance._getProperTranslation(
          inputElement,
          isNotCardNumberInput,
          someRandomMessage,
          messageElement,
          customErrorMessage
        )
      ).toEqual(customErrorMessage);
    });
    // then
    it(`should return validity state - '${
      Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH
    }' when it's card number input and has messageElement and customErrorMessage defined`, () => {
      inputElement.value = '123';
      expect(
        // @ts-ignore
        instance._getProperTranslation(
          inputElement,
          isCardNumberInput,
          someRandomMessage,
          messageElement,
          customErrorMessage
        )
      ).toEqual(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    });
    // then
    it(`should return '${someRandomMessage}' when it's card number input and has messageElement and customErrorMessage is not defined`, () => {
      expect(
        // @ts-ignore
        instance._getProperTranslation(inputElement, isNotCardNumberInput, someRandomMessage, messageElement)
      ).toEqual(someRandomMessage);
    });
  });

  // given
  describe('luhnCheckValidation', () => {
    const { instance, inputElement, luhnPassed, luhnFailed, divElement } = validationFixture();

    // then
    it(`should call setCustomValidity with ${
      Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH
    } when luhn check passed`, () => {
      inputElement.setCustomValidity = jest.fn();
      instance.luhnCheckValidation(luhnPassed, inputElement, inputElement, divElement);
      expect(inputElement.setCustomValidity).toBeCalled();
    });

    // then
    it(`should call validate method when luhn check passed`, () => {
      const spyValidate = jest.spyOn(instance, 'validate');
      instance.luhnCheckValidation(luhnFailed, inputElement, inputElement, divElement);
      expect(spyValidate).toHaveBeenCalled();
    });

    // then
    it('should call setCustomValidity with empty string when luhn check passed', () => {
      inputElement.setCustomValidity = jest.fn();
      instance.luhnCheckValidation(luhnFailed, inputElement, inputElement, divElement);
      expect(inputElement.setCustomValidity).toHaveBeenCalled();
    });
  });
});

function validationFixture() {
  const instance: Validation = new Validation();
  const inputElement = document.createElement('input');
  const messageElement = document.createElement('label');
  const someRandomMessage = 'Release the Kraken!';
  const keyCodeForOther = 71;
  const keyCodeForEnter = 13;
  const luhnPassed = true;
  const luhnFailed = false;
  const divElement = document.createElement('div');
  const cardNumberErrorData = {
    errordata: ['pan'],
    errormessage: 'Invalid field'
  };
  const expirationDateErrorData = {
    errordata: ['expirydate'],
    errormessage: 'Invalid field'
  };
  const securityCodeErrorData = {
    errordata: ['securitycode'],
    errormessage: 'Invalid field'
  };
  const backendValidityData = {
    field: 'pan',
    message: 'some message'
  };
  const merchantInputsErrorData = {
    errordata: ['billingemail'],
    errormessage: 'Invalid field'
  };

  const isCharNumberTestCases = [
    [new KeyboardEvent('keypress', { key: 'a' }), false],
    [new KeyboardEvent('keypress', { key: '0' }), true],
    [new KeyboardEvent('keypress', { key: '"' }), false],
    [new KeyboardEvent('keypress', { key: 'Shift' }), false]
  ];

  // @ts-ignore
  const eventWithEnter = new KeyboardEvent('keypress', { keyCode: keyCodeForEnter });
  // @ts-ignore
  const eventWithOther = new KeyboardEvent('keypress', { keyCode: keyCodeForOther });

  const getValidationMessagesTestCases = [
    [{ valid: true, valueMissing: false }, ''],
    [{ valid: false, valueMissing: true }, Language.translations.VALIDATION_ERROR_FIELD_IS_REQUIRED],
    [{ valid: false, patternMismatch: true }, Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH],
    [{ valid: false, customError: true }, Language.translations.VALIDATION_ERROR],
    [{ valid: false, tooShort: true }, Language.translations.VALIDATION_ERROR]
  ];
  return {
    inputElement,
    instance,
    messageElement,
    someRandomMessage,
    keyCodeForOther,
    keyCodeForEnter,
    cardNumberErrorData,
    expirationDateErrorData,
    securityCodeErrorData,
    merchantInputsErrorData,
    backendValidityData,
    isCharNumberTestCases,
    getValidationMessagesTestCases,
    eventWithEnter,
    eventWithOther,
    luhnFailed,
    luhnPassed,
    divElement
  };
}
