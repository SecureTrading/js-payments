import Validation from './Validation.class';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
class ExpirationDate extends Validation {
  private static DATE_MAX_LENGTH = 5;
  private static DATE_SLASH_PLACE = 2;
  private static EXPIRATION_DATE_REGEXP = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';
  private static MESSAGE_ELEMENT_ID = 'st-expiration-date-message';

  private readonly _fieldInstance: HTMLInputElement;

  constructor(fieldId: string) {
    super();

    this._fieldInstance = document.getElementById(fieldId) as HTMLInputElement;

    this.setValidityAttributes();
    this.setValidityListener();
    this.setValidity();
  }

  private setValidityAttributes() {
    ExpirationDate.setValidationAttribute(this._fieldInstance, 'pattern', ExpirationDate.EXPIRATION_DATE_REGEXP);
    ExpirationDate.setValidationAttribute(this._fieldInstance, 'maxlength', String(ExpirationDate.DATE_MAX_LENGTH));
  }

  private setValidityListener() {
    this._fieldInstance.addEventListener('paste', (event: ClipboardEvent) => {
      event.preventDefault();
    });

    this._fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (!ExpirationDate.isCharNumber(event)) {
        event.preventDefault();
      }
    });

    this._fieldInstance.addEventListener('input', () => {
      this.maskValue();
      this.setValidity();
    });
  }

  private maskValue() {
    if (/^\d\d$/.test(this._fieldInstance.value)) {
      this._fieldInstance.value += '/';
      return;
    }

    if (/^\d\d\/$/.test(this._fieldInstance.value)) {
      this._fieldInstance.value = this._fieldInstance.value.replace('/', '');
      return;
    }
  }

  private setValidity() {
    let isValid: boolean = this._fieldInstance.checkValidity();

    ExpirationDate.setInputErrorMessage(this._fieldInstance, ExpirationDate.MESSAGE_ELEMENT_ID);
    localStorage.setItem('expirationDateValidity', isValid.toString());

    if (isValid) {
      localStorage.setItem('expirationDate', this._fieldInstance.value);
    }
  }
}

export default ExpirationDate;
