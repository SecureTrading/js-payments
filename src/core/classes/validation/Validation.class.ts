import Language from './../Language.class';

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_VALUE_TOO_SHORT,
  VALIDATION_ERROR_PATTERN_MISMATCH
} = Language.translations;

/**
 * Base class for validation, aggregates common methods and attributes for all subclasses
 */
class Validation {
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
   * Returns last N chars of given input
   * @param cardNumber
   * @param securityCodeLength
   */
  public static getLastNChars(cardNumber: string, securityCodeLength: number) {
    return cardNumber.slice(-securityCodeLength);
  }

  /**
   * Method for setting specified validation attribute like maxlength, pattern, etc.
   * @param fieldInstance
   * @param attribute
   * @param value
   */
  public static setValidationAttribute(fieldInstance: HTMLInputElement, attribute: string, value: string) {
    fieldInstance.setAttribute(attribute, value);
  }

  /**
   * Method returns validation communicate based on validity object of input.
   * If form is valid, communicate is erased.
   * @param fieldInstance
   * @param errorContainerId
   */
  public static setInputErrorMessage(fieldInstance: HTMLInputElement, errorContainerId: string) {
    let { valueMissing, patternMismatch, tooShort, valid } = fieldInstance.validity;

    if (!valid) {
      if (valueMissing) {
        Validation.setErrorMessage(errorContainerId, VALIDATION_ERROR_FIELD_IS_REQUIRED);
      }
      if (patternMismatch) {
        Validation.setErrorMessage(errorContainerId, VALIDATION_ERROR_PATTERN_MISMATCH);
      }
      if (tooShort) {
        Validation.setErrorMessage(errorContainerId, VALIDATION_ERROR_VALUE_TOO_SHORT);
      }
      return false;
    } else {
      Validation.setErrorMessage(errorContainerId, '');
      return true;
    }
  }

  /**
   * Method placed errorMessage inside chosen container (specified by id).
   * @param containerId
   * @param messageText
   */
  private static setErrorMessage(containerId: string, messageText: string) {
    const errorContainer = document.getElementById(containerId);
    errorContainer.innerText = messageText;
  }

  /**
   * Method set custom error message, eg. when credit card is not valid.
   * @param messageContent
   * @param errorContainerId
   */
  public static customErrorMessage(messageContent: string, errorContainerId: string) {
    if (document.getElementById(errorContainerId).innerText === '') {
      document.getElementById(errorContainerId).innerText = messageContent;
    }
  }
}

export default Validation;
