interface IValidation {
  _isValid: any;
}

class Validation implements IValidation {
  _isValid: any = {};

  constructor() {
    this._isValid = {
      'creditCard': false,
      'expireDate': false,
      'securityCode': false,
    };
  }

  getValidity(fieldName: string) {
    return this._isValid[fieldName];
  };

  setValidityOfField(fieldName: string) {
    this._isValid[fieldName] = !this._isValid[fieldName];
  };

  isFormValid() {
    this._isValid.some((field: boolean) => field === true);
  };
}

export default Validation;
