import Validation from './Validation.class';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
class ExpirationDate extends Validation {
  private static DATE_MAX_LENGTH = 5;
  private static DATE_SLASH_PLACE = 2;
  private static EXPIRATION_DATE_REGEXP = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private readonly _fieldInstance: HTMLInputElement;

  constructor(fieldId: string) {
    super();
    localStorage.setItem('expirationDateValidity', 'false');
    this._fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    this.inputValidation(fieldId);
  }

  /**
   * Aggregates keypress and postMessage events listeners
   * @param fieldId
   */
  public inputValidation(fieldId: string) {
    this._fieldInstance.setAttribute('pattern', ExpirationDate.EXPIRATION_DATE_REGEXP);
    this.keypressEventListener();
    this.postMessageEventListener();
  }

  /**
   * Listens to keypress action on credit card field and attaches mask method
   */
  private keypressEventListener() {
    this._fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      this.dateInputMask(event);
    });
  }

  /**
   * Listens to postMessage event and attaches validation methods
   */
  private postMessageEventListener() {
    window.addEventListener(
      'message',
      () => {
        if (ExpirationDate.setInputErrorMessage(this._fieldInstance, 'expiration-date-error')) {
          localStorage.setItem('expirationDate', this._fieldInstance.value);
          this._fieldInstance.classList.remove('error');
        }
      },
      false
    );
  }

  /**
   * Method for masking expiration date in format MM/YY
   * @param event
   */
  public dateInputMask(event: KeyboardEvent) {
    const length = this._fieldInstance.value.length;
    if (length < ExpirationDate.DATE_MAX_LENGTH) {
      if (!ExpirationDate.isCharNumber(event)) {
        event.preventDefault();
        return false;
      }

      if (length === ExpirationDate.DATE_SLASH_PLACE) {
        this._fieldInstance.value += '/';
      }
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
}

export default ExpirationDate;
