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

  public getLastNChars(cardNumber: string, securityCodeLength: number) {
    return cardNumber.slice(-securityCodeLength);
  }

  public static setMaxLengthAttribute(
    fieldInstance: HTMLInputElement,
    length: number
  ) {
    fieldInstance.setAttribute('maxlength', String(length));
  }
}

export default Validation;
