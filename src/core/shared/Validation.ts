import Frame from './Frame';
import { StCodec } from '../classes/StCodec.class';
import Language from './Language';
import MessageBus from './MessageBus';
import { Translator } from './Translator';

interface IValidation {
  pan: boolean;
  securitycode: boolean;
  expirydate: boolean;
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

  private static BACKEND_ERROR_FIELDS_NAMES = {
    cardNumber: 'pan',
    expirationDate: 'expirydate',
    securityCode: 'securitycode'
  };
  private static ONLY_DIGITS_REGEXP = /^[0-9]*$/;
  public validation: IValidation;
  public _messageBus: MessageBus;
  private _translator: Translator;

  constructor() {
    super();
    this._messageBus = new MessageBus();
    this.onInit();
  }

  public onInit() {
    super.onInit();
    this._translator = new Translator(this._params.locale);
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

  public getValidationMessage(validityState: ValidityState): string {
    const { customError, patternMismatch, valid, valueMissing } = validityState;
    let validationMessage: string = '';
    if (!valid) {
      if (valueMissing) {
        validationMessage = VALIDATION_ERROR_FIELD_IS_REQUIRED;
      } else if (patternMismatch) {
        validationMessage = VALIDATION_ERROR_PATTERN_MISMATCH;
      } else if (customError) {
        validationMessage = VALIDATION_ERROR_PATTERN_MISMATCH;
      } else {
        validationMessage = VALIDATION_ERROR;
      }
    }

    return validationMessage;
  }

  public validate(inputElement: any, messageElement: any) {
    this.toggleErrorClass(inputElement);
    this.setMessage(inputElement, messageElement);
  }

  public toggleErrorClass = (inputElement: any) => {
    inputElement.validity.valid
      ? inputElement.classList.remove('error-field')
      : inputElement.classList.add('error-field');
  };

  /**
   * Method placed errorMessage inside chosen container (specified by id).
   * @param inputElement
   * @param messageElement
   */
  public setMessage(inputElement: any, messageElement: any) {
    const messageText = this.getValidationMessage(inputElement.validity);
    messageElement.innerText = this._translator.translate(messageText);
  }

  /**
   *
   */
  public blockForm(state: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: { state },
      type: MessageBus.EVENTS.BLOCK_FORM
    };
    this._messageBus.publish(messageBusEvent, true);
  }
}
