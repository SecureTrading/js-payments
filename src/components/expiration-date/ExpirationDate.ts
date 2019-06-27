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
  private static DISABLE_FIELD_CLASS = 'st-input--disabled';
  private static DISABLE_STATE = 'disabled';
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';
  private static LEADING_ZERO = '0';
  private static LEADING_ZERO_LIMIT = 10;
  private static ONLY_DIGITS_REGEXP = /[^\d]/g;

  private static addLeadingZero(number: number): string {
    return `${number < ExpirationDate.LEADING_ZERO_LIMIT ? ExpirationDate.LEADING_ZERO : ''}${number}`;
  }

  private date: any;
  private _datePattern: string[];
  private _blocks: number[];

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this._datePattern = ['m', 'y'];
    this._blocks = [2, 2];
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
    this._getValidatedDate(this._inputElement.value);
    this._inputElement.value = this.getISOFormatDate().length ? this.getISOFormatDate() : '';
    console.log(this._inputElement.value);
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
    console.log(event.keyCode);
    if (event.keyCode === 46) {
      this._inputElement.setSelectionRange(0, 0);
    }
  }

  /**
   * Extends onPaste method with formatting and masking.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._getValidatedDate(this._inputElement.value);
    this._inputElement.value = this.getISOFormatDate().length ? this.getISOFormatDate() : '';
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

  private static _clearNonDigitsChars = (value: string) => {
    return value.replace(ExpirationDate.ONLY_DIGITS_REGEXP, '');
  };

  /**
   * Validates indicated string.
   * @param value
   * @private
   */
  private _getValidatedDate(value: string) {
    const instance = this;
    let date: string = ExpirationDate._clearNonDigitsChars(value);
    console.log(date);
    let result: string = '';

    this._blocks.forEach((length, index) => {
      if (date.length > 0) {
        let sub = date.slice(0, length);
        const sub0 = sub.slice(0, 1);
        const rest = date.slice(length);

        if (instance._datePattern[index] === 'm') {
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
    return this.getFixedDateString(result);
  }

  private getFixedDateString(value: any) {
    let date: number[] = [];
    const datePattern = this._datePattern;
    let month;
    let year;

    month = parseInt(value.slice(0, 2), 10);
    year = parseInt(value.slice(2, 4), 10);
    date = [month, year];

    date = this.getRangeFixedDate(date);
    this.date = date;

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

  private getISOFormatDate = () => {
    console.log(this.date);
    if (this.date[1]) {
      return ExpirationDate.addLeadingZero(this.date[0]) + '/' + this.date[1];
    } else if (this.date[0] === 0) {
      return this.date[0];
    } else if (this.date[0] && this.date[0] !== 1) {
      return ExpirationDate.addLeadingZero(this.date[0]);
    }
  };

  private getRangeFixedDate(date: any) {
    var owner = this,
      datePattern = owner._datePattern,
      dateMin: any = [],
      dateMax: any = [];

    if (!date.length || (dateMin.length < 3 && dateMax.length < 3)) {
      return date;
    }

    if (
      datePattern.find(function(x) {
        return x.toLowerCase() === 'y';
      }) &&
      date[2] === 0
    ) {
      return date;
    }

    if (
      dateMax.length &&
      (dateMax[2] < date[2] ||
        (dateMax[2] === date[2] && (dateMax[1] < date[1] || (dateMax[1] === date[1] && dateMax[0] < date[0]))))
    ) {
      return dateMax;
    }

    if (
      dateMin.length &&
      (dateMin[2] > date[2] ||
        (dateMin[2] === date[2] && (dateMin[1] > date[1] || (dateMin[1] === date[1] && dateMin[0] > date[0]))))
    ) {
      return dateMin;
    }

    return date;
  }
}
