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
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    this.securityCodeLength = SecurityCode.DEFAULT_SECURITY_CODE_LENGTH;
    fieldInstance.setAttribute('minlength', String(this.securityCodeLength));
    this.inputValidationListener(fieldId);
    this.postMessageEventListener(fieldInstance);
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
        if (
          SecurityCode.setErrorMessage(fieldInstance, 'security-code-error')
        ) {
          SecurityCode.setSecurityCodeProperties(fieldInstance.value);
          fieldInstance.classList.remove('error');
        }
      }
    });
  }

  private postMessageEventListener(fieldInstance: HTMLInputElement) {
    window.addEventListener(
      'message',
      () => {
        if (
          SecurityCode.setErrorMessage(fieldInstance, 'security-code-error')
        ) {
          localStorage.setItem('expirationDate', fieldInstance.value);
          fieldInstance.classList.remove('error');
        }
      },
      false
    );
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
