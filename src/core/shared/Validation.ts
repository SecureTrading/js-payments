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
  public pan: boolean;
  public expirydate: boolean;
  public securitycode: boolean;
  public pristine: boolean;
  public dirty: boolean;
  public fieldName: string;

  constructor(fieldName: string) {
    this.fieldName = fieldName;
    this.pan = false;
    this.expirydate = false;
    this.securitycode = false;
    this.pristine = true;
    this.dirty = true;
  }

  public propagateErrorToField(errorData: any) {
    const { errordata, errormessage, requesttypedescription } = StCodec.getErrorData(errorData);
    this.fieldName = errordata[0];
    if (requesttypedescription === 'ERROR') {
      if (this.fieldName === 'pan') {
        // TODO: publish to card number field
      } else if (this.fieldName === 'securitycode') {
        // TODO: publish to security code field
      } else if (this.fieldName === 'expirydate') {
        // TODO: publish to expiry date field
      }
    }
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
  // /**
  //  * Method set custom error message, eg. when credit card is not valid.
  //  * @param messageContent
  //  * @param errorContainerId
  //  */
  // public static customErrorMessage(messageContent: string, errorContainerId: string) {
  //   if (document.getElementById(errorContainerId).innerText === '') {
  //     document.getElementById(errorContainerId).innerText = messageContent;
  //   }
  // }
}
