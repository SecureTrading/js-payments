import Validation from './Validation.class';

class ExpireDate extends Validation {
  static KEYBOARD_CODES_FOR_DIGITS = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
  static MONTH_KEYBOARD_CODE_FIRST_CHAR = [48, 49];
  static DATE_MAX_LENGTH = 5;
  static DATE_SLASH_PLACE = 2;
  static DATE_EMPTY = 0;

  constructor() {
    super();
  }

  dateInputMask(element: HTMLInputElement) {
    element.addEventListener('keyup', (event: any) => {
      let inputValueLength = element.value.length;
      if (inputValueLength < ExpireDate.DATE_MAX_LENGTH) {
        if (!ExpireDate.KEYBOARD_CODES_FOR_DIGITS.includes(event.keyCode)) {
          event.preventDefault();
        }
        if (inputValueLength === ExpireDate.DATE_EMPTY) {
          if (
            ExpireDate.MONTH_KEYBOARD_CODE_FIRST_CHAR.includes(event.keyCode)
          ) {
            event.preventDefault();
          }
        }
        if (inputValueLength === ExpireDate.DATE_SLASH_PLACE) {
          element.value += '/';
        }
      } else {
        event.preventDefault();
      }
    });
  }
}

export default ExpireDate;
