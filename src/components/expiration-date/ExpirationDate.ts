import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
export default class ExpirationDate extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static DELETE_KEY_CODE = 46;
  private static DISABLE_FIELD_CLASS = 'st-input--disabled';
  private static DISABLE_STATE = 'disabled';
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';
  private static LEADING_ZERO = '0';
  private static LEADING_ZERO_LIMIT = 10;
  private static ONLY_DIGITS_REGEXP = /[^\d]/g;
  private static BLOCKS = [2, 2];
  private static DATE_PATTERN = ['m', 'y'];

  private static addLeadingZero(number: number): string {
    return `${number < ExpirationDate.LEADING_ZERO_LIMIT ? ExpirationDate.LEADING_ZERO : ''}${number}`;
  }

  private _date: any;

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this.setFocusListener();
    this.setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
    );
  }

  /**
   * Gets translated label content.
   */
  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  /**
   * Listens to BLOCK_EXPIRATION_DATE event and toggle disable attribute and class.
   */
  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_EXPIRATION_DATE, (state: boolean) => {
      if (state) {
        this._inputElement.setAttribute(ExpirationDate.DISABLE_STATE, 'true');
        this._inputElement.classList.add(ExpirationDate.DISABLE_FIELD_CLASS);
      } else {
        this._inputElement.removeAttribute(ExpirationDate.DISABLE_STATE);
        this._inputElement.classList.remove(ExpirationDate.DISABLE_FIELD_CLASS);
      }
    });
  }

  /**
   * Listens to focus event on Expiration Date input.
   */
  public setFocusListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, () => {
      this.format(this._inputElement.value);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }

  /**
   * Formats indicated date using mask.
   * @param date
   */
  protected format(date: string) {
    this.setValue(Formatter.maskExpirationDate(date));
  }

  /**
   * Extends onBlur method and triggers sendState().
   */
  protected onBlur() {
    super.onBlur();
    this.sendState();
  }

  /**
   * Extends onFocus method.
   * @param event
   */
  protected onFocus(event: Event) {
    super.onFocus(event);
  }

  /**
   * Extends onInput method and adds masking and formatting.
   * @param event
   */
  protected onInput(event: Event) {
    super.onInput(event);
    this._setFormattedDate();
    this.sendState();
  }

  /**
   * Extends onKeyPress event with max length check.
   * @param event
   */
  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
  }

  /**
   * Extends onKeyPress event with max length check.
   * @param event
   */
  protected onKeyUp(event: KeyboardEvent) {
    this._setSelectionRange(event, 0, 0);
  }

  /**
   * Extends onPaste method with formatting and masking.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._setFormattedDate();
    this.sendState();
  }

  /**
   * Propagates expiration date change to MessageBus
   */
  private sendState() {
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Validates and formats given string and set it in the expiration date input.
   * @private
   */
  private _setFormattedDate() {
    this._getValidatedDate(this._inputElement.value);
    const formattedDate = this._getISOFormatDate();
    this._inputElement.value = formattedDate ? formattedDate : this._inputElement.value;
  }

  /**
   * Filters the non-digits from given string.
   * @param value
   * @private
   */
  private static _clearNonDigitsChars = (value: string) => {
    return value.replace(ExpirationDate.ONLY_DIGITS_REGEXP, '');
  };

  /**
   * Sets cursor on selected range (most common usage here at the beginning of input).
   * @param event
   * @param min
   * @param max
   * @private
   */
  private _setSelectionRange(event: KeyboardEvent, min: number, max: number) {
    if (event.keyCode === ExpirationDate.DELETE_KEY_CODE) {
      this._inputElement.setSelectionRange(min, max);
    }
  }

  /**
   * Validates indicated string.
   * @param value
   * @private
   */
  private _getValidatedDate(value: string) {
    let date: string = ExpirationDate._clearNonDigitsChars(value);
    let result: string = '';

    ExpirationDate.BLOCKS.forEach((length, index) => {
      if (date.length > 0) {
        let sub = date.slice(0, length);
        const sub0 = sub.slice(0, 1);
        const rest = date.slice(length);

        if (ExpirationDate.DATE_PATTERN[index] === 'm') {
          if (sub === '00') {
            sub = '01';
          } else if (parseInt(sub0, 10) > 1) {
            sub = '0' + sub0;
          } else if (parseInt(sub, 10) > 12) {
            sub = '12';
          }
        }

        result += sub;
        date = rest;
      }
    });
    return this._getFixedDateString(result);
  }

  /**
   *
   * @param value
   */
  private _getFixedDateString(value: string) {
    let date: number[] = [];
    const datePattern = ExpirationDate.DATE_PATTERN;
    let month;
    let year;

    month = parseInt(value.slice(0, 2), 10);
    year = parseInt(value.slice(2, 4), 10);
    date = [month, year];
    this._date = date;

    return date.length === 0
      ? value
      : datePattern.reduce((previous, current) => {
          switch (current) {
            case 'm':
              return previous + (date[0] === 0 ? '' : ExpirationDate.addLeadingZero(date[0]));
            case 'y':
              return previous;
          }
        }, '');
  }

  /**
   * Formats indicated string to date in format: mm/yy.
   */
  private _getISOFormatDate = () => {
    if (this._date[1]) {
      return ExpirationDate.addLeadingZero(this._date[0]) + '/' + this._date[1];
    } else if (this._date[0] === 0) {
      return this._date[0];
    } else if (this._date[0] && this._date[0] !== 1) {
      return ExpirationDate.addLeadingZero(this._date[0]);
    } else {
      return undefined;
    }
  };
}
