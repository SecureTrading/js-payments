import { StCodec } from '../classes/StCodec.class';
import Language from './Language';
import MessageBus from './MessageBus';

interface IValidation {
  pan: boolean;
  securitycode: boolean;
  expirydate: boolean;
}

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR_VALUE_TOO_SHORT,
  VALIDATION_ERROR
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
export default class Validation {
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

  private static ONLY_DIGITS_REGEXP = '^\\d+$';
  public validation: IValidation;
  public errorData: any;
  private _messageBus: MessageBus;

  constructor() {
    this._messageBus = new MessageBus();
  }

  public getErrorData(errorData: any) {
    const { errordata, errormessage } = StCodec.getErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: ''
    };

    if (errordata[0] === 'pan') {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD;
    } else if (errordata[0] === 'expirationDate') {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD;
    } else if (errordata[0] === 'securityCode') {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD;
    }
    this._messageBus.publish(validationEvent);
    return { field: errordata[0], errormessage };
  }

  public getValidationMessage(validityState: ValidityState): string {
    let validationMessage: string = '';
    if (!validityState.valid) {
      if (validityState.valueMissing) {
        validationMessage = VALIDATION_ERROR_FIELD_IS_REQUIRED;
      }
      if (validityState.patternMismatch) {
        validationMessage = VALIDATION_ERROR_PATTERN_MISMATCH;
      }
      if (validityState.tooShort) {
        validationMessage = VALIDATION_ERROR_VALUE_TOO_SHORT;
      }
      if (validityState.customError) {
        validationMessage = VALIDATION_ERROR;
      }
    }

    return validationMessage;
  }
}
