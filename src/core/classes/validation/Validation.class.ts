import Language from './../Language.class';

const {
  VALIDATION_ERROR_FIELD_IS_REQUIRED,
  VALIDATION_ERROR_VALUE_TOO_SHORT,
  VALIDATION_ERROR_PATTERN_MISMATCH
} = Language.translations;

class Validation {
  private static ONLY_DIGITS_REGEXP = '^\\d+$';

  /**
   * Method for preventing inserting non digits
   * @param event - Keypress event
   */
  public static isCharNumber(event: KeyboardEvent) {
    let key: string = event.key;
    const regex = new RegExp(Validation.ONLY_DIGITS_REGEXP);
    return regex.test(key);
  }

  /**
   * Returns last N chars of given input
   * @param cardNumber
   * @param securityCodeLength
   */
  public static getLastNChars(cardNumber: string, securityCodeLength: number) {
    console.log(cardNumber);
    console.log(securityCodeLength);
    return cardNumber.slice(-securityCodeLength);
  }

  /**
   * Method
   * @param fieldInstance
   * @param attribute
   * @param value
   */
  public static setValidationAttribute(
    fieldInstance: HTMLInputElement,
    attribute: string,
    value: string
  ) {
    fieldInstance.setAttribute(attribute, value);
  }

  /**
   *
   * @param fieldInstance
   * @param errorContainerId
   */
  public static setInputErrorMessage(
    fieldInstance: HTMLInputElement,
    errorContainerId: string
  ) {
    let {
      valueMissing,
      patternMismatch,
      tooShort,
      valid
    } = fieldInstance.validity;

    if (!valid) {
      if (valueMissing) {
        Validation.setErrorMessage(
          errorContainerId,
          VALIDATION_ERROR_FIELD_IS_REQUIRED
        );
      }
      if (patternMismatch) {
        Validation.setErrorMessage(
          errorContainerId,
          VALIDATION_ERROR_PATTERN_MISMATCH
        );
      }
      if (tooShort) {
        Validation.setErrorMessage(
          errorContainerId,
          VALIDATION_ERROR_VALUE_TOO_SHORT
        );
      }
    } else {
      Validation.setErrorMessage(errorContainerId, '');
      return true;
    }
  }

  /**
   *
   * @param containerId
   * @param messageText
   */
  private static setErrorMessage(containerId: string, messageText: string) {
    const errorContainer = document.getElementById(containerId);
    errorContainer.innerText = messageText;
  }

  /**
   *
   * @param messageContent
   * @param errorContainerId
   */
  public static customErrorMessage(
    messageContent: string,
    errorContainerId: string
  ) {
    if (document.getElementById(errorContainerId).innerText === '') {
      document.getElementById(errorContainerId).innerText = messageContent;
    }
  }
}

export default Validation;
