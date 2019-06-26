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
  private static EXPIRATION_DATE_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private static getMaxMonthNumber(month: number) {
    return Math.min(month, 12);
  }

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);

    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });

    if (this._inputElement.value) {
      this.sendState();
    }
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
    // this._inputElement.value = Formatter.trimNonNumericExceptSlash(this._inputElement.value);
    // if (this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH) {
    //   this._inputElement.value = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
    //   this.validation.validate(this._inputElement, this._messageElement);
    // }
    // this.sendState();
  }

  /**
   * Extends onKeyPress event with max length check.
   * @param event
   */
  protected onKeyPress(event: KeyboardEvent) {
    // super.onKeyPress(event);
    // if (this.isMaxLengthReached()) {
    //   event.preventDefault();
    // }
    console.log(this._getValidatedDate(this._inputElement.value));
  }

  /**
   * Extends onPaste method with formatting and masking.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    const preparedValue = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
    this._inputElement.value = Formatter.maskExpirationDateOnPaste(preparedValue);
    this.sendState();
  }

  /**
   * Checked if indicated value length is greater that expected.
   */
  private isMaxLengthReached = (): boolean => this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH;

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

  private date: any;
  private _datePattern = ['m', 'y'];
  private _blocks = [2, 2];

  private _getValidatedDate(value: any) {
    let instance = this;
    let result: any;

    value = value.replace(/[^\d]/g, '');

    this._blocks.forEach(function(length, index) {
      if (value.length > 0) {
        var sub = value.slice(0, length),
          sub0 = sub.slice(0, 1),
          rest = value.slice(length);

        switch (instance._datePattern[index]) {
          case 'd':
            if (sub === '00') {
              sub = '01';
            } else if (parseInt(sub0, 10) > 3) {
              sub = '0' + sub0;
            } else if (parseInt(sub, 10) > 31) {
              sub = '31';
            }

            break;

          case 'm':
            if (sub === '00') {
              sub = '01';
            } else if (parseInt(sub0, 10) > 1) {
              sub = '0' + sub0;
            } else if (parseInt(sub, 10) > 12) {
              sub = '12';
            }

            break;
        }

        result += sub;

        // update remaining string
        value = rest;
      }
    });
    return this.getFixedDateString(result);
  }

  private getFixedDateString(value: any) {
    var owner = this,
      datePattern = owner._datePattern,
      date: any = [],
      dayStartIndex = 0,
      monthStartIndex = 0,
      yearStartIndex = 0,
      day,
      month,
      year,
      fullYearDone = false;

    // mm-dd || dd-mm
    if (value.length === 4 && datePattern[0].toLowerCase() !== 'y' && datePattern[1].toLowerCase() !== 'y') {
      dayStartIndex = datePattern[0] === 'd' ? 0 : 2;
      monthStartIndex = 2 - dayStartIndex;
      day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);

      date = this.getFixedDate(day, month, 0);
    }

    // mm-yy || yy-mm
    if (value.length === 4 && (datePattern[0] === 'y' || datePattern[1] === 'y')) {
      monthStartIndex = datePattern[0] === 'm' ? 0 : 2;
      yearStartIndex = 2 - monthStartIndex;
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
      year = parseInt(value.slice(yearStartIndex, yearStartIndex + 2), 10);

      fullYearDone = value.slice(yearStartIndex, yearStartIndex + 2).length === 2;

      date = [0, month, year];
    }
    owner.date = date;

    var result =
      date.length === 0
        ? value
        : datePattern.reduce(function(previous, current) {
            switch (current) {
              case 'd':
                return previous + (date[0] === 0 ? '' : owner.addLeadingZero(date[0]));
              case 'm':
                return previous + (date[1] === 0 ? '' : owner.addLeadingZero(date[1]));
              case 'y':
                return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], false) : '');
              case 'Y':
                return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], true) : '');
            }
          }, '');

    return result;
  }

  private getFixedDate(month: any, year: any) {
    month = Math.min(month, 12);
    year = parseInt(year || 0, 10);
    return [month, year];
  }

  private addLeadingZero(number: any) {
    return (number < 10 ? '0' : '') + number;
  }

  private addLeadingZeroForYear(number: any, fullYearMode: any) {
    if (fullYearMode) {
      return (number < 10 ? '000' : number < 100 ? '00' : number < 1000 ? '0' : '') + number;
    }

    return (number < 10 ? '0' : '') + number;
  }
}
