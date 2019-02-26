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

  getValidity(fieldName: string) {
    return this._isValid[fieldName];
  }

  setValidityOfField(fieldName: string) {
    this._isValid[fieldName] = !this._isValid[fieldName];
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
}

export default Validation;
