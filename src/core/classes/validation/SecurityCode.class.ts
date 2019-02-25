import Validation from './Validation.class';

/**
 * Definition of security code validation
 */
class SecurityCode extends Validation {
  static KEYCODES_DIGIT = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

  constructor() {
    super();
  }

  /**
   * Method for preventing inserting non digits
   * @param event - Keypress event
   */
  static isCharNumber(event: KeyboardEvent) {
    if (!SecurityCode.KEYCODES_DIGIT.includes(event.keyCode)) {
      event.preventDefault();
    }
  }
}

export default SecurityCode;
