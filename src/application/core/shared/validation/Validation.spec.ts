import each from 'jest-each';
import { StCodec } from '../../services/st-codec/StCodec.class';
import { FormState } from '../../models/constants/FormState';
import {
  VALIDATION_ERROR,
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH
} from '../../models/constants/Translations';
import { MessageBus } from '../message-bus/MessageBus';
import { Validation } from './Validation';
import { mock } from 'ts-mockito';
import { Frame } from '../frame/Frame';

jest.mock('./../message-bus/MessageBus');
jest.mock('./../notification/Notification');

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
  describe('isKeyEnter()', () => {
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
    // TODO FormState.COMPLETE
    const { instance } = validationFixture();
    // then
    it('should return state of blocking action equals blocked if MessageBus event data is true', () => {
      expect(instance.blockForm(FormState.BLOCKED)).toBe(undefined);
    });

    // then
    it('should return state of blocking action equals complete if MessageBus event data is true', () => {
      expect(instance.blockForm(FormState.COMPLETE)).toBe(undefined);
    });

    // then
    it('should return state of blocking action equals available if MessageBus event data is false', () => {
      expect(instance.blockForm(FormState.AVAILABLE)).toBe(undefined);
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
      Validation.setCustomValidationError(someRandomMessage, inputElement);
      expect(inputElement.checkValidity()).toEqual(false);
    });

    // then
    it('should have validity equal true if validation message is not set', () => {
      Validation.setCustomValidationError('', inputElement);
      expect(inputElement.checkValidity()).toEqual(true);
    });
  });
  // given
  describe('_toggleErrorClass()', () => {
    const { instance, inputElement } = validationFixture();
    // then
    it('should remove error class if field is valid', () => {
      inputElement.setCustomValidity('');
      // @ts-ignore
      Validation._toggleErrorClass(inputElement);
      expect(inputElement.classList.contains(Validation.ERROR_FIELD_CLASS)).toEqual(false);
    });

    // then
    it('should add error class if field is invalid', () => {
      inputElement.setCustomValidity('some error');
      // @ts-ignore
      Validation._toggleErrorClass(inputElement);
      expect(inputElement.classList.contains(Validation.ERROR_FIELD_CLASS)).toEqual(true);
    });
  });

  // given
  describe('_getTranslation()', () => {
    const { instance, inputElement, messageElement, someRandomMessage } = validationFixture();
    const customErrorMessage = 'Some message';
    const isCardNumberInput = true;
    const isNotCardNumberInput = false;
    // then
    it(`should return '${customErrorMessage}' when it's not card number input and has messageElement and customErrorMessage defined`, () => {
      expect(
        // @ts-ignore
        instance._getTranslation(
          inputElement,
          isNotCardNumberInput,
          someRandomMessage,
          messageElement,
          customErrorMessage
        )
      ).toEqual(customErrorMessage);
    });
    // then
    it(`should return validity state - '${VALIDATION_ERROR_PATTERN_MISMATCH}' when it's card number input and has messageElement and customErrorMessage defined`, () => {
      inputElement.value = '123';
      expect(
        // @ts-ignore
        instance._getTranslation(inputElement, isCardNumberInput, someRandomMessage, messageElement, customErrorMessage)
      ).toEqual(someRandomMessage);
    });
    // then
    it(`should return '${someRandomMessage}' when it's card number input and has messageElement and customErrorMessage is not defined`, () => {
      expect(
        // @ts-ignore
        instance._getTranslation(inputElement, isNotCardNumberInput, someRandomMessage, messageElement)
      ).toEqual(someRandomMessage);
    });
    // then
    it(`should return '${VALIDATION_ERROR_PATTERN_MISMATCH}' when it's card number input and has messageElement and it's not valid`, () => {
      inputElement.setCustomValidity('test');
      expect(
        // @ts-ignore
        instance._getTranslation(inputElement, isCardNumberInput, someRandomMessage, messageElement)
      ).toEqual(VALIDATION_ERROR_PATTERN_MISMATCH);
    });
  });

  // given
  describe('formValidation', () => {
    const { instance } = validationFixture();
    const formFields = {
      expirationDate: { value: 'expirydate', validity: true },
      cardNumber: { value: 'pan', validity: false },
      securityCode: { value: 'securitycode', validity: true }
    };
    // when
    beforeEach(() => {
      instance.blockForm = jest.fn();
    });

    // then
    it('should set _isFormValid and _isPaymentReady to true', () => {
      // @ts-ignore
      instance.formValidation(true, ['pan', 'expirydate', 'securitycode'], formFields, false, false);
      // @ts-ignore
      expect(instance._formValidity).toEqual(true);
      // @ts-ignore
      expect(instance._isPaymentReady).toEqual(true);
    });

    // then
    it('should call blockForm method if _isFormValid and _isPaymentReady are true', () => {
      instance.formValidation(true, ['pan', 'expirydate', 'securitycode'], formFields, false, false);
      // @ts-ignore
      expect(instance.blockForm).toHaveBeenCalled();
    });

    // then
    it('should set _isFormValid and _card variables if dataInJwt is false', () => {
      instance.formValidation(false, ['pan', 'expirydate', 'securitycode'], formFields, false, false);
      // @ts-ignore
      expect(instance._formValidity).toEqual(false);
      // @ts-ignore
      expect(instance._card).toEqual({
        expirydate: 'expirydate',
        pan: 'pan',
        securitycode: 'securitycode'
      });
    });
  });

  // given
  describe('setFormValidity', () => {
    const { instance } = validationFixture();
    const validationEvent = {
      data: { testValue: 'test value' },
      type: MessageBus.EVENTS.VALIDATE_FORM
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      instance.setFormValidity({ testValue: 'test value' });
    });

    // then
    it('should call publish event', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(validationEvent);
    });
  });
});

function validationFixture() {
  let frame: Frame;
  let messageBus: MessageBus;
  frame = mock(Frame);
  messageBus = mock(MessageBus);
  const instance: Validation = new Validation();
  const inputElement = document.createElement('input');
  const inputElementMerchant = document.createElement('input');
  inputElementMerchant.setAttribute('data-st-name', 'billingemail');
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
    [new KeyboardEvent('keypress', { key: 'a' }), true],
    [new KeyboardEvent('keypress', { key: '0' }), false],
    [new KeyboardEvent('keypress', { key: '"' }), true],
    [new KeyboardEvent('keypress', { key: 'Shift' }), true]
  ];

  // @ts-ignore
  const eventWithEnter = new KeyboardEvent('keypress', { keyCode: keyCodeForEnter });
  // @ts-ignore
  const eventWithOther = new KeyboardEvent('keypress', { keyCode: keyCodeForOther });

  const getValidationMessagesTestCases = [
    [{ valid: true, valueMissing: false }, undefined],
    [{ valid: false, valueMissing: true }, VALIDATION_ERROR_FIELD_IS_REQUIRED],
    [{ valid: false, patternMismatch: true }, VALIDATION_ERROR_PATTERN_MISMATCH],
    [{ valid: false, customError: true }, VALIDATION_ERROR],
    [{ valid: false, tooShort: true }, VALIDATION_ERROR]
  ];
  return {
    inputElement,
    inputElementMerchant,
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
