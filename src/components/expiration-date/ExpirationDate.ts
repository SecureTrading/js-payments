import FormField from '../../core/shared/FormField';
import Selectors from '../../core/shared/Selectors';
import Formatter from '../../core/shared/Formatter';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
export default class ExpirationDate extends FormField {
  private static INPUT_MAX_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT_SELECTOR, Selectors.EXPIRATION_DATE_MESSAGE_SELECTOR);

    this.setAttributes({
      maxlength: ExpirationDate.INPUT_MAX_LENGTH,
      pattern: ExpirationDate.INPUT_PATTERN
    });
  }

  static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.EXPIRATION_DATE_INPUT_SELECTOR);
  }

  format(data: string) {
    let dataFormatted = Formatter.maskExpirationDate(data);
    this.setValue(dataFormatted);
  }
}
