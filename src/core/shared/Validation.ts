import { StCodec } from '../classes/StCodec.class';
import { BrandDetailsType } from '../imports/cardtype';
import { IErrorData, IMessageBusValidateField, IValidation } from '../models/Validation';
import BinLookup from './BinLookup';
import Frame from './Frame';
import Language from './Language';
import MessageBus from './MessageBus';
import Selectors from './Selectors';
import { Translator } from './Translator';
import Utils from './Utils';

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR
} = Language.translations;

export default class Validation extends Frame {
  public static ERROR_FIELD_CLASS: string = 'error-field';

  public static isCharNumber(event: KeyboardEvent) {
    const key: string = event.key;
    const regex = new RegExp(Validation.ESCAPE_DIGITS_REGEXP);
    return regex.test(key);
  }

  public static isKeyEnter(event: KeyboardEvent) {
    const keyCode: number = event.keyCode;
    return keyCode === Validation.ENTER_KEY_CODE;
  }

  public static clearNonDigitsChars = (value: string) => {
    return value.replace(Validation.ESCAPE_DIGITS_REGEXP, '');
  };

  public static setCustomValidationError(inputElement: HTMLInputElement, errorContent: string) {
    inputElement.setCustomValidity(errorContent);
  }

  public static getValidationMessage(validityState: ValidityState): string {
    const { customError, patternMismatch, valid, valueMissing } = validityState;
    let validationMessage: string = '';
    if (!valid) {
      if (valueMissing) {
        validationMessage = VALIDATION_ERROR_FIELD_IS_REQUIRED;
      } else if (patternMismatch) {
        validationMessage = VALIDATION_ERROR_PATTERN_MISMATCH;
      } else if (customError) {
        validationMessage = VALIDATION_ERROR;
      } else {
        validationMessage = VALIDATION_ERROR;
      }
    }
    return validationMessage;
  }

  protected static STANDARD_FORMAT_PATTERN: string = '(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?';
  private static ESCAPE_DIGITS_REGEXP = /[^\d]/g;
  private static BACKSPACE_KEY_CODE: number = 8;
  private static CARD_NUMBER_DEFAULT_LENGTH: number = 16;
  private static DELETE_KEY_CODE: number = 46;
  private static MATCH_CHARS = /[^\d]/g;
  private static MATCH_DIGITS = /^[0-9]*$/;
  private static LUHN_CHECK_ARRAY: number[] = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  private static ERROR_CLASS: string = 'error';
  private static CURSOR_SINGLE_SKIP: number = 1;
  private static CURSOR_DOUBLE_SKIP: number = 2;
  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: 'pan',
    expirationDate: 'expirydate',
    securityCode: 'securitycode'
  };
  private static ENTER_KEY_CODE = 13;
  private static readonly MERCHANT_EXTRA_FIELDS_PREFIX = 'billing';

  public validation: IValidation;
  public cardDetails: any;
  public securityCodeValue: string;
  public cardNumberValue: string;
  public expirationDateValue: string;
  protected _messageBus: MessageBus;
  protected binLookup: BinLookup;
  private _translator: Translator;
  private _currentKeyCode: number;
  private _selectionRangeEnd: number;
  private _selectionRangeStart: number;
  private _matchDigitsRegexp: RegExp;
  private _cursorSkip: number = 0;
  private _isFormValid: boolean;
  private _isPaymentReady: boolean;
  private _card: ICard;

  constructor() {
    super();
    this.onInit();
  }

  public backendValidation(inputElement: HTMLInputElement, messageElement: HTMLElement, event: string) {
    this._messageBus.subscribe(event, (data: IMessageBusValidateField) => {
      this.checkBackendValidity(data, inputElement, messageElement);
    });
  }

  public isPressedKeyDelete(): boolean {
    return this._currentKeyCode === Validation.DELETE_KEY_CODE;
  }

  public setKeyDownProperties(element: HTMLInputElement, event: KeyboardEvent) {
    this._currentKeyCode = event.keyCode;
    this._selectionRangeStart = element.selectionStart;
    this._selectionRangeEnd = element.selectionEnd;
  }

  public keepCursorAtSamePosition(element: HTMLInputElement) {
    const lengthFormatted: number = element.value.length;
    const isLastCharSlash: boolean = element.value.charAt(lengthFormatted - 2) === '/';
    const start: number = this._selectionRangeStart;
    const end: number = this._selectionRangeEnd;

    if (this.isPressedKeyDelete()) {
      element.setSelectionRange(start, end);
    } else if (this._isPressedKeyBackspace()) {
      element.setSelectionRange(start - Validation.CURSOR_SINGLE_SKIP, end - Validation.CURSOR_SINGLE_SKIP);
    } else if (isLastCharSlash) {
      ++this._cursorSkip;
      element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
    } else if (element.value.charAt(end) === ' ') {
      ++this._cursorSkip;
      element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
    } else {
      element.setSelectionRange(start + Validation.CURSOR_SINGLE_SKIP, end + Validation.CURSOR_SINGLE_SKIP);
    }
  }

  public luhnCheck(field: HTMLInputElement, input: HTMLInputElement, message: HTMLDivElement) {
    const { value } = input;
    const isLuhnOk: boolean = this._luhnAlgorithm(value);
    this.luhnCheckValidation(isLuhnOk, field, input, message);
  }

  public blockForm(state: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: MessageBus.EVENTS.BLOCK_FORM
    };
    this._messageBus.publish(messageBusEvent, true);
    return state;
  }

  public callSubmitEvent() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS.CALL_SUBMIT_EVENT
    };
    this._messageBus.publish(messageBusEvent, true);
  }

  public checkBackendValidity(
    data: IMessageBusValidateField,
    inputElement: HTMLInputElement,
    messageElement?: HTMLElement
  ) {
    this.setError(inputElement, messageElement, data);
  }

  public getErrorData(errorData: IErrorData) {
    const { errordata, errormessage } = StCodec.getErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: ''
    };

    if (errordata[0] === Validation.BACKEND_ERROR_FIELDS_NAMES.cardNumber) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD;
      this._messageBus.publish(validationEvent);
    }
    if (errordata[0] === Validation.BACKEND_ERROR_FIELDS_NAMES.expirationDate) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD;
      this._messageBus.publish(validationEvent);
    }
    if (errordata[0] === Validation.BACKEND_ERROR_FIELDS_NAMES.securityCode) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD;
      this._messageBus.publish(validationEvent);
    }
    if (errordata.find((element: any) => element.includes(Validation.MERCHANT_EXTRA_FIELDS_PREFIX))) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD;
      this._messageBus.publish(validationEvent, true);
    }

    return { field: errordata[0], errormessage };
  }

  public setError(inputElement: HTMLInputElement, messageElement: HTMLElement, data: IMessageBusValidateField) {
    this._assignErrorDetails(inputElement, messageElement, data);
  }

  public validate(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string) {
    this._toggleErrorClass(inputElement);
    this._setMessage(inputElement, messageElement, customErrorMessage);
  }

  public luhnCheckValidation(luhn: boolean, field: HTMLInputElement, input: HTMLInputElement, message: HTMLDivElement) {
    if (!luhn) {
      field.setCustomValidity(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
      this.validate(input, message, Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      field.setCustomValidity('');
    }
  }

  public formValidation(
    dataInJwt: boolean,
    paymentReady: boolean,
    formFields: any,
    deferInit: boolean,
    fieldsToSubmit: string[]
  ): { validity: boolean; card: ICard } {
    this._isPaymentReady = paymentReady;
    if (dataInJwt) {
      this._isFormValid = true;
      this._isPaymentReady = true;
    } else {
      const cardNumberValidity: boolean = fieldsToSubmit.includes('pan') ? formFields.cardNumber.validity : true;
      const expirationDateValidity: boolean = fieldsToSubmit.includes('date')
        ? formFields.expirationDate.validity
        : true;
      const securityCodeValidity: boolean = fieldsToSubmit.includes('code') ? formFields.securityCode.validity : true;
      this._isFormValid = cardNumberValidity && expirationDateValidity && securityCodeValidity;
      this._card = {
        expirydate: formFields.expirationDate.value,
        pan: formFields.cardNumber.value,
        securitycode: formFields.securityCode.value
      };
    }

    if ((this._isPaymentReady && this._isFormValid) || (deferInit && this._isFormValid)) {
      this.blockForm(true);
    }
    return {
      card: this._card,
      validity: (this._isPaymentReady && this._isFormValid) || (deferInit && this._isFormValid)
    };
  }

  public removeError(element: HTMLInputElement, errorContainer: HTMLElement) {
    element.classList.remove(Validation.ERROR_CLASS);
    errorContainer.textContent = '';
  }

  public limitLength(value: string, length: number): string {
    return value ? value.substring(0, length) : '';
  }

  public setFormValidity(state: any) {
    const validationEvent: IMessageBusEvent = {
      data: { ...state },
      type: MessageBus.EVENTS.VALIDATE_FORM
    };
    this._messageBus.publish(validationEvent, true);
  }

  protected onInit() {
    super.onInit();
    this._messageBus = new MessageBus();
    this.binLookup = new BinLookup();
    this._matchDigitsRegexp = new RegExp(Validation.MATCH_DIGITS);
    this._translator = new Translator(this._params.locale);
  }

  protected _isPressedKeyBackspace(): boolean {
    return this._currentKeyCode === Validation.BACKSPACE_KEY_CODE;
  }

  protected removeNonDigits(value: string): string {
    if (value) {
      return value.replace(Validation.MATCH_CHARS, '');
    }
  }

  protected getCardDetails(cardNumber: string = ''): BrandDetailsType {
    return this.binLookup.binLookup(cardNumber);
  }

  protected cardNumber(value: string) {
    this.cardNumberValue = this.removeNonDigits(value);
    this.cardDetails = this.getCardDetails(this.cardNumberValue);
    const length = this.cardDetails.type
      ? Utils.getLastElementOfArray(this.cardDetails.length)
      : Validation.CARD_NUMBER_DEFAULT_LENGTH;
    this.cardNumberValue = this.limitLength(this.cardNumberValue, length);
  }

  protected expirationDate(value: string) {
    this.expirationDateValue = value ? this.removeNonDigits(value) : '';
  }

  protected securityCode(value: string, length: number) {
    this.securityCodeValue = value ? this.limitLength(this.removeNonDigits(value), length) : '';
  }

  /**
   * Luhn Algorithm
   * From the right:
   *    Step 1: take the value of this digit
   *    Step 2: if the offset from the end is even
   *    Step 3: double the value, then sum the digits
   *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
   * @param cardNumber
   * @private
   */
  private _luhnAlgorithm(cardNumber: string): boolean {
    const cardNumberWithoutSpaces = cardNumber.replace(/\s/g, '');
    let bit = 1;
    let cardNumberLength = cardNumberWithoutSpaces.length;
    let sum = 0;

    while (cardNumberLength) {
      const val = parseInt(cardNumberWithoutSpaces.charAt(--cardNumberLength), 10);
      bit = bit ^ 1;
      const algorithmValue = bit ? Validation.LUHN_CHECK_ARRAY[val] : val;
      sum += algorithmValue;
    }
    return sum && sum % 10 === 0;
  }

  private _toggleErrorClass = (inputElement: HTMLInputElement) => {
    const isValid: boolean = inputElement.validity.valid;
    if (isValid) {
      inputElement.classList.remove(Validation.ERROR_FIELD_CLASS);
    } else {
      inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
    }
  };

  private _setMessage(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string) {
    const isCardNumberInput: boolean = inputElement.getAttribute('id') === Selectors.CARD_NUMBER_INPUT;
    const validityState = Validation.getValidationMessage(inputElement.validity);
    messageElement.innerText = this._getProperTranslation(
      inputElement,
      isCardNumberInput,
      validityState,
      messageElement,
      customErrorMessage
    );
  }

  private _getProperTranslation(
    inputElement: HTMLInputElement,
    isCardNumberInput: boolean,
    validityState: string,
    messageElement?: HTMLElement,
    customErrorMessage?: string
  ) {
    if (messageElement && customErrorMessage && !isCardNumberInput) {
      return this._translator.translate(customErrorMessage);
    } else if (messageElement && inputElement.value && isCardNumberInput && !inputElement.validity.valid) {
      return this._translator.translate(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      return this._translator.translate(validityState);
    }
  }

  private _assignErrorDetails(
    inputElement: HTMLInputElement,
    messageElement: HTMLElement,
    data: IMessageBusValidateField
  ) {
    const { message } = data;
    if (messageElement && message) {
      if (messageElement.innerText !== Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH) {
        messageElement.innerText = this._translator.translate(message);
        inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
        inputElement.setCustomValidity(message);
      }
    }
    inputElement.setCustomValidity(data.message);
  }
}
