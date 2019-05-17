import Language from './Language';
import { StCodec } from '../classes/StCodec.class';

interface IValidation {
  pan: boolean;
  securitycode: boolean;
  expirydate: boolean;
}

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR_VALUE_TOO_SHORT
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
export default class Validation {
  public validation: IValidation;
  public errorData: any;

  public static getErrorData(errorData: any) {
    const { errordata, errormessage, requesttypedescription } = StCodec.getErrorData(errorData);
    return { field: errordata[0], errormessage, requesttypedescription };
  }

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

  constructor() {}

  public getValidationMessage(validityState: ValidityState, customValidity: any): string {
    let validationMessage: string = '';
    console.log(validityState);
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
    }
    if (!customValidity) {
      validationMessage = VALIDATION_ERROR_PATTERN_MISMATCH;
    }

    return validationMessage;
  }

  private static ONLY_DIGITS_REGEXP = '^\\d+$';
}
