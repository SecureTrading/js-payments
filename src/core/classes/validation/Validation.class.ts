interface IValidation {
  _isValid: any;
}

class Validation implements IValidation {
  private static ONLY_DIGITS_REGEXP = '^\\d+$';
  _isValid: any = {};

  constructor() {
    this._isValid = {
      creditCard: false,
      expireDate: false,
      securityCode: false
    };
  }

  isFormValid() {
    this._isValid.some((field: boolean) => field === true);
  }

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
    return cardNumber.slice(-securityCodeLength);
  }

  public static setMaxLengthAttribute(
    fieldInstance: HTMLInputElement,
    length: number
  ) {
    fieldInstance.setAttribute('maxlength', String(length));
  }

  public static setErrorMessage(fieldInstance: HTMLInputElement) {
    let {
      valueMissing,
      patternMismatch,
      tooShort,
      valid
    } = fieldInstance.validity;
    if (!valid) {
      fieldInstance.classList.add('error');
      let errorContainer = document.createElement('div');
      errorContainer.setAttribute('id', 'st-form__error');
      if (valueMissing) {
        errorContainer.innerText = 'Value missing';
        fieldInstance.parentNode.insertBefore(
          errorContainer,
          fieldInstance.nextSibling
        );
      } else if (patternMismatch) {
        errorContainer.innerText = 'Pattern mismatch';
        fieldInstance.parentNode.insertBefore(
          errorContainer,
          fieldInstance.nextSibling
        );
      } else if (tooShort) {
        errorContainer.innerText = 'Value too short';
        fieldInstance.parentNode.insertBefore(
          errorContainer,
          fieldInstance.nextSibling
        );
      }
    } else {
      return true;
    }
  }
}

export default Validation;
