import Validation from './Validation.class';
import Language from './../Language.class';

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
    this.inputValidationListener();
    this.postMessageEventListener();
  }

  /**
   * Listener on security code field.
   * 1. Sets max and minlength of field.
   * 2. Checks if indicated character is number
   * 3. If it is, checks if there are some errors in indicated expression, if yes
   *    it sets error message if not it removes error.
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
          return true;
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
            SecurityCode.customErrorMessage(
              Language.translations.VALIDATION_ERROR_CARD_AND_CODE,
              'security-code-error'
            );
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
