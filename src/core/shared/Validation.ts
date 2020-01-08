import { StCodec } from '../classes/StCodec.class';
import { IErrorData, IMessageBusValidateField, IValidation } from '../models/Validation';
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

export default class Validation extends Frame {
  private static readonly CLEAR_VALUE: string = '';
  public static ERROR_FIELD_CLASS: string = 'error-field';

  public static isCharNumber(event: KeyboardEvent) {
    const key: string = event.key;
    const regex = new RegExp(Validation.ONLY_DIGITS_REGEXP);
    return regex.test(key);
  }

  public static isEnter(event: KeyboardEvent) {
    const keyCode: number = event.keyCode;
    return keyCode === Validation.ENTER_KEY_CODE;
  }

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

  public static setMerchantInputErrorMessage(input: HTMLInputElement): void {
    input.nextSibling.textContent = Validation.CLEAR_VALUE;
  }

  public static removeClassFromClassList(input: HTMLInputElement, className: string) {
    input.classList.remove(className);
  }

  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: 'pan',
    expirationDate: 'expirydate',
    securityCode: 'securitycode'
  };
  private static ENTER_KEY_CODE = 13;
  private static ONLY_DIGITS_REGEXP = /^[0-9]*$/;
  private static readonly MERCHANT_EXTRA_FIELDS_PREFIX = 'billing';

  public validation: IValidation;
  protected _messageBus: MessageBus;
  private _translator: Translator;
  private _isFormValid: boolean;
  private _isPaymentReady: boolean;
  private _card: ICard;

  constructor() {
    super();
    this._messageBus = new MessageBus();
    this.onInit();
  }

  public backendValidation(inputElement: HTMLInputElement, messageElement: HTMLElement, event: string) {
    this._messageBus.subscribe(event, (data: IMessageBusValidateField) => {
      this.checkBackendValidity(data, inputElement, messageElement);
    });
  }

  public blockForm(state: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: MessageBus.EVENTS.BLOCK_FORM
    };
    this._messageBus.publish(messageBusEvent, true);
    return state;
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

  public setFormValidity(state: any) {
    const validationEvent: IMessageBusEvent = {
      data: { ...state },
      type: MessageBus.EVENTS.VALIDATE_FORM
    };
    this._messageBus.publish(validationEvent, true);
  }

  protected onInit() {
    super.onInit();
    this._translator = new Translator(this._params.locale);
  }

  private _toggleErrorClass = (inputElement: HTMLInputElement) => {
    inputElement.validity.valid
      ? inputElement.classList.remove(Validation.ERROR_FIELD_CLASS)
      : inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
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
