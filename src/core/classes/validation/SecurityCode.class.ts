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
    SecurityCode.setValidationAttribute(
      fieldInstance,
      'maxlength',
      String(this.securityCodeLength)
    );
    SecurityCode.setValidationAttribute(
      fieldInstance,
      'minlength',
      String(this.securityCodeLength)
    );
    fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (!SecurityCode.isCharNumber(event)) {
        event.preventDefault();
      } else {
        if (
          SecurityCode.setInputErrorMessage(
            fieldInstance,
            'security-code-error'
          )
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
        const cardNumber = localStorage.getItem('cardNumber');
        const securityCodeLength = Number(
          localStorage.getItem('securityCodeLength')
        );
        if (
          SecurityCode.setInputErrorMessage(
            fieldInstance,
            'security-code-error'
          )
        ) {
          if (
            SecurityCode.cardNumberSecurityCodeMatch(
              cardNumber,
              securityCodeLength
            )
          ) {
            localStorage.setItem('securityCode', fieldInstance.value);
            fieldInstance.classList.remove('error');
          } else {
            SecurityCode.customErrorMessage(
              'Security code doesnt match card number',
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
   *
   * @param securityCode
   */
  private static setSecurityCodeProperties(securityCode: string) {
    localStorage.setItem('securityCode', securityCode);
  }

  /**
   *
   * @param cardNumber
   * @param securityCodeLength
   */
  public static cardNumberSecurityCodeMatch(
    cardNumber: string,
    securityCodeLength: number
  ) {
    const cardNumberLastChars = SecurityCode.getLastNChars(
      cardNumber,
      securityCodeLength
    );
    if (
      localStorage.getItem('securityCode').length === securityCodeLength &&
      cardNumberLastChars === localStorage.getItem('securityCode')
    ) {
      return true;
    }
    return false;
  }
}

export default SecurityCode;
