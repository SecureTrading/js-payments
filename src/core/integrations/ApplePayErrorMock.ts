export class ApplePayErrorMock {
  private _errorCode: string;
  private _contactField: string;
  private _message: string;
  constructor(errorCode: string, contactField?: string, message?: string) {
    this._errorCode = errorCode;
    this._contactField = contactField;
    this._message = message;
  }
}
