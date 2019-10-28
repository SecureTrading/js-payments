import { StCodec } from '../classes/StCodec.class';
import { IErrorData, IMessageBusValidateField, IValidation } from '../models/Validation';
import BinLookup from './BinLookup';
import Frame from './Frame';
import Language from './Language';
import MessageBus from './MessageBus';
import Selectors from './Selectors';
import { Translator } from './Translator';

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
export default class Validation extends Frame {
  public static ERROR_FIELD_CLASS: string = 'error-field';

  /**
   * Method to determine whether enter key is pressed
   * @param event
   */
  public static isEnter(event: KeyboardEvent) {
    const keyCode: number = event.keyCode;
    return keyCode === Validation.ENTER_KEY_CODE;
  }

  /**
   * Sets custom validation error in validity input object.
   * @param inputElement
   * @param errorContent
   */
  public static setCustomValidationError(inputElement: HTMLInputElement, errorContent: string) {
    inputElement.setCustomValidity(errorContent);
  }

  /**
   * Gets validity state from input object and sets proper Validation message.
   * @param validityState
   * @private
   */
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

  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: 'pan',
    expirationDate: 'expirydate',
    securityCode: 'securitycode'
  };
  private static ENTER_KEY_CODE = 13;
  private static ONLY_DIGITS_REGEXP = /^[0-9]*$/;
  private static readonly MERCHANT_EXTRA_FIELDS_PREFIX = 'billing';
  private static BACKSPACE_KEY_CODE: number = 8;
  private static CARD_NUMBER_DEFAULT_LENGTH: number = 16;
  private static DELETE_KEY_CODE: number = 46;
  private static MATCH_CHARS = /[^\d]/g;
  private static MATCH_DIGITS = /^[0-9]*$/;
  private static SECURITY_CODE_DEFAULT_LENGTH: number = 3;
  private static LUHN_CHECK_ARRAY: number[] = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  private static ERROR_CLASS: string = 'error';
  private static CURSOR_SINGLE_SKIP: number = 1;
  private static CURSOR_DOUBLE_SKIP: number = 2;

  public validation: IValidation;
  protected binLookup: BinLookup;
  protected _messageBus: MessageBus;

  protected cardNumberValue: string;
  protected expirationDateValue: string;
  protected securityCodeValue: string;
  private _translator: Translator;
  private _isFormValid: boolean;
  private _isPaymentReady: boolean;
  private _card: ICard;
  private _currentKeyCode: number;
  private _selectionRangeEnd: number;
  private _selectionRangeStart: number;
  private _matchDigitsRegexp: RegExp;
  private _cursorSkip: number = 0;

  constructor(locale: string) {
    super();
    this.binLookup = new BinLookup();
    this._translator = new Translator(locale);
    this._matchDigitsRegexp = new RegExp(Validation.MATCH_DIGITS);
    this._messageBus = new MessageBus();
    this.onInit();
  }

  /**
   * Listens to backend validation event from MessageBus and sets proper validation actions.
   * @param inputElement
   * @param messageElement
   * @param event
   */
  public backendValidation(inputElement: HTMLInputElement, messageElement: HTMLElement, event: string) {
    this._messageBus.subscribe(event, (data: IMessageBusValidateField) => {
      this.checkBackendValidity(data, inputElement, messageElement);
    });
  }

  /**
   * Send request via MessageBus to let know if form should be blocked or not.
   */
  public blockForm(state: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: MessageBus.EVENTS.BLOCK_FORM
    };
    this._messageBus.publish(messageBusEvent, true);
    return state;
  }

  /**
   * Triggers setError method with proper parameters.
   * @param data
   * @param inputElement
   * @param messageElement
   */
  public checkBackendValidity(
    data: IMessageBusValidateField,
    inputElement: HTMLInputElement,
    messageElement?: HTMLElement
  ) {
    this.setError(inputElement, messageElement, data);
  }

  /**
   * Gets backend error data and assign it to proper input field.
   * @param errorData
   */
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

  /**
   * Sets all necessary error properties on input and label.
   * @param inputElement
   * @param messageElement
   * @param message
   */
  public setError(inputElement: HTMLInputElement, messageElement: HTMLElement, data: IMessageBusValidateField) {
    this._assignErrorDetails(inputElement, messageElement, data);
  }

  /**
   * Validate particular form input.
   * @param inputElement
   * @param messageElement
   * @param customErrorMessage
   */
  public validate(inputElement: HTMLInputElement, messageElement: HTMLElement, customErrorMessage?: string) {
    this._toggleErrorClass(inputElement);
    this._setMessage(inputElement, messageElement, customErrorMessage);
  }

  /**
   *
   * @param luhn
   * @param field
   * @param input
   * @param label
   */
  public luhnCheckValidation(luhn: boolean, field: HTMLInputElement, input: HTMLInputElement, message: HTMLDivElement) {
    if (!luhn) {
      field.setCustomValidity(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
      this.validate(input, message, Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      field.setCustomValidity('');
    }
  }

  /**
   * Validation process method.
   * @param dataInJwt
   * @param paymentReady
   * @param formFields
   */
  public formValidation(
    dataInJwt: boolean,
    paymentReady: boolean,
    formFields: any,
    deferInit: boolean
  ): { validity: boolean; card: ICard } {
    this._isPaymentReady = paymentReady;
    if (dataInJwt) {
      this._isFormValid = true;
      this._isPaymentReady = true;
    } else {
      this._isFormValid =
        formFields.cardNumber.validity && formFields.expirationDate.validity && formFields.securityCode.validity;
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

  /**
   * Send a request through the MessageBus to trigger form validation.
   * @param state
   */
  public setFormValidity(state: any) {
    const validationEvent: IMessageBusEvent = {
      data: { ...state },
      type: MessageBus.EVENTS.VALIDATE_FORM
    };
    this._messageBus.publish(validationEvent, true);
  }

  /**
   * Extended onInit() method from Frame.ts class.
   */
  protected onInit() {
    super.onInit();
    this._translator = new Translator(this._params.locale);
  }

  /**
   * Add or remove error class from input field.
   * @param inputElement
   */
  private _toggleErrorClass = (inputElement: HTMLInputElement) => {
    inputElement.validity.valid
      ? inputElement.classList.remove(Validation.ERROR_FIELD_CLASS)
      : inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
  };

  /**
   * Method placed errorMessage inside chosen container (specified by id).
   * @param inputElement
   * @param messageElement
   * @param customErrorMessage
   */
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

  /**
   * Returns adequate translation to specific field.
   * @param inputElement
   * @param isCardNumberInput
   * @param validityState
   * @param messageElement
   * @param customErrorMessage
   * @private
   */
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

  /**
   *
   * @param inputElement
   * @param messageElement
   * @param data
   * @private
   */
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

  // public setKeyDownProperties(element: HTMLInputElement, event: KeyboardEvent) {
  //   this._currentKeyCode = event.keyCode;
  //   this._selectionRangeStart = element.selectionStart;
  //   this._selectionRangeEnd = element.selectionEnd;
  // }
  //
  // public keepCursorAtSamePosition(element: HTMLInputElement) {
  //   const lengthFormatted: number = element.value.length;
  //   const isLastCharSlash: boolean = element.value.charAt(lengthFormatted - 2) === '/';
  //   const start: number = this._selectionRangeStart;
  //   const end: number = this._selectionRangeEnd;
  //
  //   if (this._isPressedKeyDelete()) {
  //     element.setSelectionRange(start, end);
  //   } else if (this._isPressedKeyBackspace()) {
  //     element.setSelectionRange(start - Validation.CURSOR_SINGLE_SKIP, end - Validation.CURSOR_SINGLE_SKIP);
  //   } else if (isLastCharSlash) {
  //     ++this._cursorSkip;
  //     element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
  //   } else if (element.value.charAt(end) === ' ') {
  //     ++this._cursorSkip;
  //     element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
  //   } else {
  //     element.setSelectionRange(start + Validation.CURSOR_SINGLE_SKIP, end + Validation.CURSOR_SINGLE_SKIP);
  //   }
  // }
  //
  // public luhnCheck(element: HTMLInputElement) {
  //   const { value } = element;
  //   this._luhnAlgorithm(value) ? element.setCustomValidity('') : element.setCustomValidity('luhn');
  // }
  //
  // public validate(element: HTMLInputElement, errorContainer: HTMLElement) {
  //   const { customError, patternMismatch, valid, valueMissing } = element.validity;
  //   if (!valid) {
  //     if (valueMissing) {
  //       this._setError(element, errorContainer, 'Field is required');
  //     } else if (patternMismatch) {
  //       this._setError(element, errorContainer, 'Value mismatch pattern');
  //     } else if (customError) {
  //       this._setError(element, errorContainer, 'Value mismatch pattern');
  //     } else {
  //       this._setError(element, errorContainer, 'Invalid field');
  //     }
  //   } else {
  //     this._removeError(element, errorContainer);
  //   }
  // }
  //
  // public onPaste(event: ClipboardEvent) {
  //   let { clipboardData } = event;
  //   event.preventDefault();
  //   if (typeof clipboardData === 'undefined') {
  //     // @ts-ignore
  //     clipboardData = window.clipboardData.getData('Text');
  //   } else {
  //     // @ts-ignore
  //     clipboardData = event.clipboardData.getData('text/plain');
  //   }
  //   return clipboardData;
  // }
  //
  // protected cardNumber(value: string) {
  //   this.cardNumberValue = this.removeNonDigits(value);
  //   const cardDetails = this.getCardDetails(this.cardNumberValue);
  //   const length = cardDetails.type
  //     ? Utils.getLastElementOfArray(cardDetails.length)
  //     : Validation.CARD_NUMBER_DEFAULT_LENGTH;
  //   this.cardNumberValue = this.limitLength(this.cardNumberValue, length);
  // }
  //
  // protected expirationDate(value: string) {
  //   this.expirationDateValue = this.removeNonDigits(value);
  // }
  //
  // protected securityCode(value: string) {
  //   this.securityCodeValue = this.removeNonDigits(value);
  //   const cardDetails = this.getCardDetails(this.cardNumberValue);
  //   const cardLength = Utils.getLastElementOfArray(cardDetails.cvcLength);
  //   const length = cardDetails.type && cardLength ? cardLength : Validation.SECURITY_CODE_DEFAULT_LENGTH;
  //   this.securityCodeValue = this.limitLength(this.securityCodeValue, length);
  // }
  //
  // protected getCardDetails(cardNumber: string = ''): BrandDetailsType {
  //   return this.binLookup.binLookup(cardNumber);
  // }
  //
  // protected _isPressedKeyBackspace(): boolean {
  //   return this._currentKeyCode === Validation.BACKSPACE_KEY_CODE;
  // }
  //
  // protected _isPressedKeyDelete(): boolean {
  //   return this._currentKeyCode === Validation.DELETE_KEY_CODE;
  // }
  //
  // protected limitLength(value: string, length: number): string {
  //   return value.substring(0, length);
  // }
  //
  // protected removeNonDigits(value: string): string {
  //   return value.replace(Validation.MATCH_CHARS, '');
  // }
  //
  // /**
  //  * Luhn Algorithm
  //  * From the right:
  //  *    Step 1: take the value of this digit
  //  *    Step 2: if the offset from the end is even
  //  *    Step 3: double the value, then sum the digits
  //  *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
  //  * @param cardNumber
  //  * @private
  //  */
  // private _luhnAlgorithm(cardNumber: string): boolean {
  //   const cardNumberWithoutSpaces = cardNumber.replace(/\s/g, '');
  //   let bit = 1;
  //   let cardNumberLength = cardNumberWithoutSpaces.length;
  //   let sum = 0;
  //
  //   while (cardNumberLength) {
  //     const val = parseInt(cardNumberWithoutSpaces.charAt(--cardNumberLength), 10);
  //     bit = bit ^ 1;
  //     const algorithmValue = bit ? Validation.LUHN_CHECK_ARRAY[val] : val;
  //     sum += algorithmValue;
  //   }
  //   return sum && sum % 10 === 0;
  // }
  //
  // private _setError(element: HTMLInputElement, errorContainer: HTMLElement, errorMessage: string) {
  //   element.classList.add(Validation.ERROR_CLASS);
  //   errorContainer.textContent = this._translator.translate(errorMessage);
  // }
  //
  // private _removeError(element: HTMLInputElement, errorContainer: HTMLElement) {
  //   element.classList.remove(Validation.ERROR_CLASS);
  //   errorContainer.textContent = '';
  // }  // public setKeyDownProperties(element: HTMLInputElement, event: KeyboardEvent) {
  //   this._currentKeyCode = event.keyCode;
  //   this._selectionRangeStart = element.selectionStart;
  //   this._selectionRangeEnd = element.selectionEnd;
  // }
  //
  // public keepCursorAtSamePosition(element: HTMLInputElement) {
  //   const lengthFormatted: number = element.value.length;
  //   const isLastCharSlash: boolean = element.value.charAt(lengthFormatted - 2) === '/';
  //   const start: number = this._selectionRangeStart;
  //   const end: number = this._selectionRangeEnd;
  //
  //   if (this._isPressedKeyDelete()) {
  //     element.setSelectionRange(start, end);
  //   } else if (this._isPressedKeyBackspace()) {
  //     element.setSelectionRange(start - Validation.CURSOR_SINGLE_SKIP, end - Validation.CURSOR_SINGLE_SKIP);
  //   } else if (isLastCharSlash) {
  //     ++this._cursorSkip;
  //     element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
  //   } else if (element.value.charAt(end) === ' ') {
  //     ++this._cursorSkip;
  //     element.setSelectionRange(start + Validation.CURSOR_DOUBLE_SKIP, end + Validation.CURSOR_DOUBLE_SKIP);
  //   } else {
  //     element.setSelectionRange(start + Validation.CURSOR_SINGLE_SKIP, end + Validation.CURSOR_SINGLE_SKIP);
  //   }
  // }
  //
  // public luhnCheck(element: HTMLInputElement) {
  //   const { value } = element;
  //   this._luhnAlgorithm(value) ? element.setCustomValidity('') : element.setCustomValidity('luhn');
  // }
  //
  // public validate(element: HTMLInputElement, errorContainer: HTMLElement) {
  //   const { customError, patternMismatch, valid, valueMissing } = element.validity;
  //   if (!valid) {
  //     if (valueMissing) {
  //       this._setError(element, errorContainer, 'Field is required');
  //     } else if (patternMismatch) {
  //       this._setError(element, errorContainer, 'Value mismatch pattern');
  //     } else if (customError) {
  //       this._setError(element, errorContainer, 'Value mismatch pattern');
  //     } else {
  //       this._setError(element, errorContainer, 'Invalid field');
  //     }
  //   } else {
  //     this._removeError(element, errorContainer);
  //   }
  // }
  //
  // public onPaste(event: ClipboardEvent) {
  //   let { clipboardData } = event;
  //   event.preventDefault();
  //   if (typeof clipboardData === 'undefined') {
  //     // @ts-ignore
  //     clipboardData = window.clipboardData.getData('Text');
  //   } else {
  //     // @ts-ignore
  //     clipboardData = event.clipboardData.getData('text/plain');
  //   }
  //   return clipboardData;
  // }
  //
  // protected cardNumber(value: string) {
  //   this.cardNumberValue = this.removeNonDigits(value);
  //   const cardDetails = this.getCardDetails(this.cardNumberValue);
  //   const length = cardDetails.type
  //     ? Utils.getLastElementOfArray(cardDetails.length)
  //     : Validation.CARD_NUMBER_DEFAULT_LENGTH;
  //   this.cardNumberValue = this.limitLength(this.cardNumberValue, length);
  // }
  //
  // protected expirationDate(value: string) {
  //   this.expirationDateValue = this.removeNonDigits(value);
  // }
  //
  // protected securityCode(value: string) {
  //   this.securityCodeValue = this.removeNonDigits(value);
  //   const cardDetails = this.getCardDetails(this.cardNumberValue);
  //   const cardLength = Utils.getLastElementOfArray(cardDetails.cvcLength);
  //   const length = cardDetails.type && cardLength ? cardLength : Validation.SECURITY_CODE_DEFAULT_LENGTH;
  //   this.securityCodeValue = this.limitLength(this.securityCodeValue, length);
  // }
  //
  // protected getCardDetails(cardNumber: string = ''): BrandDetailsType {
  //   return this.binLookup.binLookup(cardNumber);
  // }
  //
  // protected _isPressedKeyBackspace(): boolean {
  //   return this._currentKeyCode === Validation.BACKSPACE_KEY_CODE;
  // }
  //
  // protected _isPressedKeyDelete(): boolean {
  //   return this._currentKeyCode === Validation.DELETE_KEY_CODE;
  // }
  //
  // protected limitLength(value: string, length: number): string {
  //   return value.substring(0, length);
  // }
  //
  // protected removeNonDigits(value: string): string {
  //   return value.replace(Validation.MATCH_CHARS, '');
  // }
  //
  // /**
  //  * Luhn Algorithm
  //  * From the right:
  //  *    Step 1: take the value of this digit
  //  *    Step 2: if the offset from the end is even
  //  *    Step 3: double the value, then sum the digits
  //  *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
  //  * @param cardNumber
  //  * @private
  //  */
  // private _luhnAlgorithm(cardNumber: string): boolean {
  //   const cardNumberWithoutSpaces = cardNumber.replace(/\s/g, '');
  //   let bit = 1;
  //   let cardNumberLength = cardNumberWithoutSpaces.length;
  //   let sum = 0;
  //
  //   while (cardNumberLength) {
  //     const val = parseInt(cardNumberWithoutSpaces.charAt(--cardNumberLength), 10);
  //     bit = bit ^ 1;
  //     const algorithmValue = bit ? Validation.LUHN_CHECK_ARRAY[val] : val;
  //     sum += algorithmValue;
  //   }
  //   return sum && sum % 10 === 0;
  // }
  //
  // private _setError(element: HTMLInputElement, errorContainer: HTMLElement, errorMessage: string) {
  //   element.classList.add(Validation.ERROR_CLASS);
  //   errorContainer.textContent = this._translator.translate(errorMessage);
  // }
  //
  // private _removeError(element: HTMLInputElement, errorContainer: HTMLElement) {
  //   element.classList.remove(Validation.ERROR_CLASS);
  //   errorContainer.textContent = '';
  // }
}
