class Validation {
  private _isValid: object;

  constructor() {
    this._isValid = {
      'creditCard': false,
      'expireDate': false,
      'securityCode': false,
    };
  }
}

export default Validation;
