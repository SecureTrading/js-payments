import Validation from './Validation.class';

class ExpirationDate extends Validation {
  static KEYBOARD_CODES_FOR_DIGITS = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
  static MONTH_CHARS = [48, 49];
  static DATE_MAX_LENGTH = 5;
  static DATE_SLASH_PLACE = 2;
  static DATE_EMPTY = 0;
  static EXPIRATION_DATE_REGEXP = `^(0[1-9]|1[0-2])\\/([0-9]{2})$`;

  constructor() {
    super();
  }

  /**
   * Method for masking expiration date in format MM/YY
   * @param element
   */
  dateInputMask(element: HTMLInputElement) {
    element.addEventListener('keyup', (event: any) => {
      let length = element.value.length;
      if (length < ExpirationDate.DATE_MAX_LENGTH) {
        if (!ExpirationDate.KEYBOARD_CODES_FOR_DIGITS.includes(event.keyCode)) {
          event.preventDefault();
        }

        if (length === ExpirationDate.DATE_EMPTY) {
          if (
            ExpirationDate.KEYBOARD_CODES_FOR_DIGITS.includes(event.keyCode)
          ) {
            event.preventDefault();
          }
        }

        if (length === ExpirationDate.DATE_SLASH_PLACE) {
          element.value += '/';
        }
      } else {
        event.preventDefault();
      }
    });
  }

  isDateValid(date: string) {}
}

export default ExpirationDate;
