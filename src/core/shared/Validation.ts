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
  VALIDATION_ERROR,
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
export default class Validation extends Frame {
  public static ERROR_FIELD_CLASS = 'error-field';

  /**
   * Method for prevent inserting non digits
   * @param event
   */
  public static isCharNumber(event: KeyboardEvent) {
    const key: string = event.key;
    const regex = new RegExp(Validation.ONLY_DIGITS_REGEXP);
    return regex.test(key);
  }

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

  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: 'pan',
    expirationDate: 'expirydate',
    securityCode: 'securitycode',
  };
  private static ENTER_KEY_CODE = 13;
  private static ONLY_DIGITS_REGEXP = /^[0-9]*$/;
  private static readonly MERCHANT_EXTRA_FIELDS_PREFIX = 'billing';

  /**
   * Gets validity state from input object and sets proper Validation message.
   * @param validityState
   * @private
   */
  private static getValidationMessage(validityState: ValidityState): string {
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

  public validation: IValidation;
  protected _messageBus: MessageBus;
  private _translator: Translator;

  constructor() {
    super();
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
      this.validate(inputElement, messageElement);
    });
  }

  /**
   * Send request via MessageBus to let know if form should be blocked or not.
   */
  public blockForm(state: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: MessageBus.EVENTS.BLOCK_FORM,
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
    messageElement?: HTMLElement,
  ) {
    this.setError(inputElement, messageElement, data.message);
  }

  /**
   * Gets backend error data and assign it to proper input field.
   * @param errorData
   */
  public getErrorData(errorData: IErrorData) {
    const { errordata, errormessage } = StCodec.getErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: '',
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
  public setError(inputElement: HTMLInputElement, messageElement: HTMLElement, message: string) {
    inputElement.classList.add(Validation.ERROR_FIELD_CLASS);
    if (messageElement && messageElement.innerText !== 'Value mismatch pattern') {
      messageElement.innerText = this._translator.translate(message);
    }
    inputElement.setCustomValidity(message);
  }

  /**
   * Validate particular form input.
   * @param inputElement
   * @param messageElement
   * @param customErrorMessage
   */
  public validate(inputElement: HTMLInputElement, messageElement?: HTMLElement, customErrorMessage?: string) {
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
  private _setMessage(inputElement: HTMLInputElement, messageElement?: HTMLElement, customErrorMessage?: string) {
    const isCardNumberInput: boolean = inputElement.getAttribute('id') === Selectors.CARD_NUMBER_INPUT;
    const validityState = Validation.getValidationMessage(inputElement.validity);
    messageElement.innerText = this._getProperTranslation(
      inputElement,
      isCardNumberInput,
      validityState,
      messageElement,
      customErrorMessage,
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
    customErrorMessage?: string,
  ) {
    if (messageElement && customErrorMessage && !isCardNumberInput) {
      return this._translator.translate(customErrorMessage);
    } else if (messageElement && inputElement.value && isCardNumberInput) {
      return this._translator.translate(Language.translations.VALIDATION_ERROR_PATTERN_MISMATCH);
    } else {
      return this._translator.translate(validityState);
    }
  }
}
