import Validation from './Validation.class';

/**
 * Definition of security code validation
 */
class SecurityCode extends Validation {
  get securityCodeLength(): number {
    return this._securityCodeLength;
  }

  set securityCodeLength(value: number) {
    this._securityCodeLength = value;
  }

  private _securityCodeLength: number;
  private static DEFAULT_SECURITY_CODE_LENGTH = 4;

  constructor(fieldId: string) {
    super();
    this.securityCodeLength = SecurityCode.DEFAULT_SECURITY_CODE_LENGTH;
    this.inputValidationListener(fieldId);
  }

  /**
   * Listener on security code field which check validation
   * @param fieldId
   */
  private inputValidationListener(fieldId: string) {
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    SecurityCode.setMaxLengthAttribute(fieldInstance, this.securityCodeLength);
    fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (!SecurityCode.isCharNumber(event)) {
        event.preventDefault();
      } else {
        SecurityCode.setSecurityCodeProperties(fieldInstance.value);
      }
    });
  }

  /**
   * Sets security code properties in localStorage
   *
   * @param securityCode
   */
  private static setSecurityCodeProperties(securityCode: string) {
    localStorage.setItem('securityCode', securityCode);
  }
}

export default SecurityCode;
