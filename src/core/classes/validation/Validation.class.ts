interface IValidation {
  _isValid: any;
}

class Validation implements IValidation {
  static KEYCODES_DIGIT = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
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
    if (!Validation.KEYCODES_DIGIT.includes(event.key)) {
      event.preventDefault();
    }
  }
}

export default Validation;
