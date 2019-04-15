import Language from './Language';

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_PATTERN_MISMATCH,
  VALIDATION_ERROR_VALUE_TOO_SHORT
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
export default class Validation {
  private static ONLY_DIGITS_REGEXP = '^\\d+$';

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
    return (keyCode === 13);
  }

  /**
   * Returns last N chars of given input
   * @param cardNumber
   * @param securityCodeLength
   */
  public static getLastNChars(cardNumber: string, securityCodeLength: number) {
    return cardNumber.slice(-securityCodeLength);
  }

  public static getValidationMessage(validityState: ValidityState): string {
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
    }

    return validationMessage;
  }

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
