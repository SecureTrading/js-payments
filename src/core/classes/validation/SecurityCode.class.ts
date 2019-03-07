import Validation from './Validation.class';
import Language from './../Language.class';

/**
 * Definition of security code validation
 */
class SecurityCode extends Validation {
  private static DEFAULT_SECURITY_CODE_LENGTH: string = '3';
  private static MESSAGE_ELEMENT_ID = 'st-security-code-message';
  private readonly _fieldInstance: HTMLInputElement;
  private _securityCodeLength: string;

  constructor(fieldId: string) {
    super();

    this._fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    this._securityCodeLength = SecurityCode.DEFAULT_SECURITY_CODE_LENGTH;

    this.setValidityAttributes();
    this.setValidityListener();
    this.setValidity();
  }

  private setValidityAttributes() {
    SecurityCode.setValidationAttribute(this._fieldInstance, 'maxlength', String(this._securityCodeLength));
    SecurityCode.setValidationAttribute(this._fieldInstance, 'minlength', String(this._securityCodeLength));
  }

  private setValidityListener() {
    this._fieldInstance.addEventListener('paste', (event: ClipboardEvent) => {
      event.preventDefault();
    });

    this._fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (!SecurityCode.isCharNumber(event)) {
        event.preventDefault();
      }
    });

    this._fieldInstance.addEventListener('input', () => {
      this.setValidity();
    });
  }

  private setValidity() {
    let isValid: boolean = this._fieldInstance.checkValidity();

    SecurityCode.setInputErrorMessage(this._fieldInstance, SecurityCode.MESSAGE_ELEMENT_ID);
    localStorage.setItem('securityCodeValidity', isValid.toString());

    if (isValid) {
      SecurityCode.setSecurityCodeProperties(this._fieldInstance.value);
    }
  }

  /**
   * Listens to postMessage event from Form
   * @deprecated
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
