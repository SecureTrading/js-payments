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

  public static setErrorMessage(
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
      fieldInstance.classList.add('error');
      let errorContainer = document.getElementById(errorContainerId);
      if (valueMissing) {
        errorContainer.innerText = 'Value missing';
      }
      if (patternMismatch) {
        errorContainer.innerText = 'Pattern mismatch';
      }
      if (tooShort) {
        errorContainer.innerText = 'Value too short';
      }
    } else {
      return true;
    }
  }

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
