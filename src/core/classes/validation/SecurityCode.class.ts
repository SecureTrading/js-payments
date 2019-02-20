import Validation from './Validation.class';

class SecurityCode extends Validation {
  static AMEX_CARD_NAME = 'AMEX';
  static AMEX_SECURITY_CODE_LENGTH = 4;
  static NONAMEX_SECURITY_CODE_LENGTH = 3;
  static KEYCODES_DIGIT = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
  static KEYCODES_NUMPAD = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

  constructor() {
    super();
  }

  /**
   * Method for validating length
   * @param length Length of indicated code
   * @param cardType
   */
  isLengthCorrect(length: number, cardType: string) {
    if (cardType === SecurityCode.AMEX_CARD_NAME) {
      if (length === SecurityCode.AMEX_SECURITY_CODE_LENGTH) {
        return true;
      }
    } else {
      if (length === SecurityCode.NONAMEX_SECURITY_CODE_LENGTH) {
        return true;
      }
    }
    return false;
  }

  /**
   * Method for preventing inserting non digits
   * @param field Field on which we fire event
   */
  isCharNumber(field: HTMLElement) {
    field.addEventListener('keypress', event => {
      if (
        !SecurityCode.KEYCODES_DIGIT.includes(event.keyCode) ||
        !SecurityCode.KEYCODES_NUMPAD.includes(event.keyCode)
      ) {
        event.preventDefault();
      }
    });
  }
}

export default SecurityCode;
