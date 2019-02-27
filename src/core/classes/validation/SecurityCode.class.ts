import Validation from './Validation.class';
import { appEndpoint } from '../../imports/iframe';

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
    fieldInstance.addEventListener('keypress', event => {
      if (!SecurityCode.isCharNumber(event)) {
        event.preventDefault();
      }
    });
  }

  /**
   * Checks whether security code has proper length and its value corresponds with last N chars of credit card number
   * It communicates with app on merchant side and it's local storage to check the status of security code
   * @param securityCode
   */
  private isSecurityCodeValid(securityCode: string) {
    const securityCodeProperties = {
      length: securityCode.length,
      value: securityCode
    };
    window.postMessage(securityCodeProperties, appEndpoint);
    window.addEventListener('message', event => {
      return event;
    });
  }
}

export default SecurityCode;
