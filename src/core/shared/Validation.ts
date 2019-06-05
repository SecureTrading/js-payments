import { StCodec } from '../classes/StCodec.class';
import Frame from './Frame';
import Language from './Language';
import MessageBus from './MessageBus';
import { Translator } from './Translator';

interface IValidation {
  pan: boolean;
  expirydate: boolean;
  securitycode: boolean;
}

interface IMessageBusValidateField {
  field: string;
  message: string;
}

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
export default class Validation extends Frame {
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
    return keyCode === 13;
  }

  /**
   * Returns last N chars of given input
   * @param cardNumber
   * @param securityCodeLength
   */
  public static getLastNChars(cardNumber: string, securityCodeLength: number) {
    return cardNumber.slice(-securityCodeLength);
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
    securityCode: 'securitycode'
  };
  private static ONLY_DIGITS_REGEXP = /^[0-9]*$/;

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

  public getErrorData(errorData: any) {
    const { errordata, errormessage } = StCodec.getErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: ''
    };

    if (errordata[0] === Validation.BACKEND_ERROR_FIELDS_NAMES.cardNumber) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD;
    } else if (errordata[0] === Validation.BACKEND_ERROR_FIELDS_NAMES.expirationDate) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD;
    } else if (errordata[0] === Validation.BACKEND_ERROR_FIELDS_NAMES.securityCode) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD;
    }
    this._messageBus.publish(validationEvent);

    return { field: errordata[0], errormessage };
  }

  /**
   * Listens to backend validation event from MessageBus and sets proper validation actions.
   * @param inputElement
   * @param messageElement
   * @param event
   */
  public backendValidation(inputElement: HTMLInputElement, messageElement: HTMLElement, event: string) {
    this._messageBus.subscribe(event, (data: any) => {
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
    messageElement: HTMLElement
  ) {
    this.setError(inputElement, messageElement, data.message);
  }

  /**
   * Sets all necessary error properties on input and label.
   * @param inputElement
   * @param messageElement
   * @param message
   */
  public setError(inputElement: HTMLInputElement, messageElement: HTMLElement, message: string) {
    inputElement.classList.add('error-field');
    messageElement.innerText = this._translator.translate(message);
    inputElement.setCustomValidity(message);
  }

  /**
   * Validate particular form input.
   * @param inputElement
   * @param messageElement
   */
  public validate(inputElement: HTMLInputElement, messageElement: HTMLElement) {
    this.toggleErrorClass(inputElement);
    this.setMessage(inputElement, messageElement);
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
  private toggleErrorClass = (inputElement: HTMLInputElement) => {
    inputElement.validity.valid
      ? inputElement.classList.remove('error-field')
      : inputElement.classList.add('error-field');
  };

  /**
   * Method placed errorMessage inside chosen container (specified by id).
   * @param inputElement
   * @param messageElement
   */
  private setMessage(inputElement: HTMLInputElement, messageElement: HTMLElement) {
    const messageText = Validation.getValidationMessage(inputElement.validity);
    messageElement.innerText = this._translator.translate(messageText);
  }
}
