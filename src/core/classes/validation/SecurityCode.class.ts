import Validation from './Validation.class';

/**
 * Definition of security code validation
 */
class SecurityCode extends Validation {
  get securityCodeLength(): string {
    return this._securityCodeLength;
  }

  set securityCodeLength(value: string) {
    this._securityCodeLength = value;
  }

  private _fieldInstance: HTMLInputElement;
  private _securityCodeLength: string;
  private static DEFAULT_SECURITY_CODE_LENGTH = '3';

  constructor(fieldId: string) {
    super();
    localStorage.setItem('securityCodeValidity', 'false');
    this._fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    this.securityCodeLength = SecurityCode.DEFAULT_SECURITY_CODE_LENGTH;
    SecurityCode.setValidationAttribute(this._fieldInstance, 'minlength', this.securityCodeLength);
    SecurityCode.setValidationAttribute(this._fieldInstance, 'maxlength', this.securityCodeLength);
    this.inputValidationListener();
    this.postMessageEventListener();
  }

  /**
   * Listener on security code field which check validation
   */
  private inputValidationListener() {
    SecurityCode.setValidationAttribute(this._fieldInstance, 'maxlength', String(this.securityCodeLength));
    SecurityCode.setValidationAttribute(this._fieldInstance, 'minlength', String(this.securityCodeLength));
    this._fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (!SecurityCode.isCharNumber(event)) {
        event.preventDefault();
        return false;
      } else {
        if (SecurityCode.setInputErrorMessage(this._fieldInstance, 'security-code-error')) {
          SecurityCode.setSecurityCodeProperties(this._fieldInstance.value);
          this._fieldInstance.classList.remove('error');
        }
      }
    });
  }

  /**
   * Listens to postMessage event from Form
   */
  private postMessageEventListener() {
    window.addEventListener(
      'message',
      () => {
        const cardNumber = localStorage.getItem('cardNumber');
        const securityCodeLength = Number(localStorage.getItem('securityCodeLength'));
        if (SecurityCode.setInputErrorMessage(this._fieldInstance, 'security-code-error')) {
          if (SecurityCode.cardNumberSecurityCodeMatch(cardNumber, securityCodeLength)) {
            localStorage.setItem('securityCode', this._fieldInstance.value);
            this._fieldInstance.classList.remove('error');
          } else {
            SecurityCode.customErrorMessage('Security code doesnt match card number', 'security-code-error');
          }
        }
      },
      false
    );
  }

  /**
   * Sets security code properties in localStorage
   * @param securityCode
   */
  private static setSecurityCodeProperties(securityCode: string) {
    localStorage.setItem('securityCode', securityCode);
  }

  /**
   * Matches Security Code with card number
   * @param cardNumber
   * @param securityCodeLength
   */
  public static cardNumberSecurityCodeMatch(cardNumber: string, securityCodeLength: number) {
    const cardNumberLastChars = SecurityCode.getLastNChars(cardNumber, securityCodeLength);
    const securityCodeLengthRequired = localStorage.getItem('securityCode');
    return (
      securityCodeLengthRequired.length === securityCodeLength && cardNumberLastChars === securityCodeLengthRequired
    );
  }
}

export default SecurityCode;
