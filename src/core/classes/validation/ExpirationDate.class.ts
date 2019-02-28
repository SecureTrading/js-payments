import Validation from './Validation.class';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
class ExpirationDate extends Validation {
  private static DATE_MAX_LENGTH = 5;
  private static DATE_SLASH_PLACE = 2;
  private static EXPIRATION_DATE_REGEXP = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  constructor(fieldId: string) {
    super();
    this.inputValidationListener(fieldId);
  }

  /**
   * Listens to keypress action on credit card field and attach validation methods
   * @param fieldId
   */
  private inputValidationListener(fieldId: string) {
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      ExpirationDate.dateInputMask(fieldInstance, event);
    });
    window.addEventListener(
      'message',
      () => {
        if (ExpirationDate.isDateValid(fieldInstance)) {
          localStorage.setItem('expirationDate', fieldInstance.value);
          fieldInstance.classList.remove('error');
        } else {
          fieldInstance.classList.add('error');
        }
      },
      false
    );
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
      if (!ExpirationDate.isCharNumber(event)) {
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
   * Checks whether date has valid format (MM/YY)
   * @param fieldInstance
   */
  public static isDateValid(fieldInstance: HTMLInputElement) {
    const { value } = fieldInstance;
    const dateRegexp = new RegExp(ExpirationDate.EXPIRATION_DATE_REGEXP);
    return dateRegexp.test(value);
  }
}

export default ExpirationDate;
