import Validation from './Validation.class';

/**
 * Defines specific Expiration Date validation methods aand attributes
 */
class ExpirationDate extends Validation {
  private static DATE_MAX_LENGTH = 5;
  private static DATE_SLASH_PLACE = 2;
  private static EXPIRATION_DATE_REGEXP = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  constructor() {
    super();
  }

  /**
   * Method for masking expiration date in format MM/YY
   * @param fieldInstance
   * @param event
   */
  public static dateInputMask(
    fieldInstance: HTMLInputElement,
    event: KeyboardEvent
  ) {
    const length = fieldInstance.value.length;
    if (length < ExpirationDate.DATE_MAX_LENGTH) {
      if (!Validation.KEYCODES_DIGIT.includes(event.key)) {
        event.preventDefault();
      }

      if (length === ExpirationDate.DATE_SLASH_PLACE) {
        fieldInstance.value += '/';
      }
    } else {
      event.preventDefault();
    }
  }

  /**
   * Checks whether date has valid format (MMM/YY)
   * @param fieldInstance
   */
  public static isDateValid(fieldInstance: HTMLInputElement) {
    const { value } = fieldInstance;
    const dateRegexp = new RegExp(ExpirationDate.EXPIRATION_DATE_REGEXP);
    return dateRegexp.test(value);
  }
}

export default ExpirationDate;
