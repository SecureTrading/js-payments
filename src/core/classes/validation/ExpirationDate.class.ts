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
    this.inputValidation(fieldId);
  }

  /**
   * Aggregates keypress and postMessage events listeners
   * @param fieldId
   */
  private inputValidation(fieldId: string) {
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    this.keypressEventListener(fieldInstance);
    this.postMessageEventListener(fieldInstance);
  }

  /**
   * Listens to keypress action on credit card field and attaches mask method
   * @param fieldInstance
   */
  private keypressEventListener(fieldInstance: HTMLInputElement) {
    fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      ExpirationDate.dateInputMask(fieldInstance, event);
    });
  }

  /**
   * Listens to postMessage event and attaches validation methods
   * @param fieldInstance
   */
  private postMessageEventListener(fieldInstance: HTMLInputElement) {
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
        return false;
      }

      if (length === ExpirationDate.DATE_SLASH_PLACE) {
        fieldInstance.value += '/';
      }
      return true;
    } else {
      event.preventDefault();
      return false;
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
