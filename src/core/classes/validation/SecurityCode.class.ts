import Validation from './Validation.class';

/**
 * Definition of security code validation
 */
class SecurityCode extends Validation {
  static AMEX_SECURITY_CODE_LENGTH = 4;
  static NON_AMEX_SECURITY_CODE_LENGTH = 3;
  static KEYCODES_DIGIT = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

  public securityCodeLength: number;

  constructor() {
    super();
    this.securityCodeLength = 3;
  }

  /**
   * Method for validating length based on html attributes max and minlength
   * @param validity Validation object of form
   */
  static isLengthCorrect(validity: object) {
    if (validity.tooShort) {
      return 'Security code is too short';
    } else if (validity.tooLong) {
      return 'Security code is too long';
    }
  }

  /**
   * Method for preventing inserting non digits
   * @param event Keypress event
   */
  static isCharNumber(event: Event) {
    if (!SecurityCode.KEYCODES_DIGIT.includes(event.keyCode)) {
      event.preventDefault();
    }
  }

  /**
   * Returns number of digits which security code has to have (due to be AMEX or not)
   * @param isCreditCardAmex: Gets boolean with information if indicated card is AMEX or not
   */
  static getSecurityCodeLength(isCreditCardAmex: boolean) {
    return isCreditCardAmex
      ? SecurityCode.AMEX_SECURITY_CODE_LENGTH
      : SecurityCode.NON_AMEX_SECURITY_CODE_LENGTH;
  }
}

export default SecurityCode;
