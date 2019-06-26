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
    // super.onInput(event);
    this._getValidatedDate(this._inputElement.value);
    this._inputElement.value = this.getISOFormatDate().length ? this.getISOFormatDate() : this._inputElement.value;
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
   * Extends onPaste method with formatting and masking.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    // const preparedValue = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
    // this._inputElement.value = Formatter.maskExpirationDateOnPaste(preparedValue);
    this._getValidatedDate(this._inputElement.value);
    this._inputElement.value = this.getISOFormatDate().length ? this.getISOFormatDate() : this._inputElement.value;
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

  private date: any;
  private _datePattern = ['m', 'y'];
  private _blocks = [2, 2];

  private _getValidatedDate(value: any) {
    const instance = this;
    let result: string = '';
    value = value.replace(/[^\d]/g, '');

    this._blocks.forEach(function(length, index) {
      if (value.length > 0) {
        let sub = value.slice(0, length);
        let sub0 = sub.slice(0, 1);
        let rest = value.slice(length);

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
        value = rest;
      }
    });
    return this.getFixedDateString(result);
  }

  private getFixedDateString(value: any) {
    const owner = this;
    let datePattern = owner._datePattern;
    let date: any = [];
    let monthStartIndex = 0;
    let yearStartIndex = 0;
    let month;
    let year;
    let fullYearDone = false;

    if (value.length === 4 && datePattern[0] === 'm') {
      yearStartIndex = 2 - monthStartIndex;
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
      year = parseInt(value.slice(yearStartIndex, yearStartIndex + 2), 10);

      fullYearDone = value.slice(yearStartIndex, yearStartIndex + 2).length === 2;

      date = [month, year];
    }
    owner.date = date;

    return date.length === 0
      ? value
      : datePattern.reduce(function(previous, current) {
          switch (current) {
            case 'm':
              return previous + (date[0] === 0 ? '' : ExpirationDate.addLeadingZero(date[0]));
            case 'y':
              return previous + (fullYearDone ? ExpirationDate.addLeadingZero(date[1]) : '');
          }
        }, '');
  }

  private getISOFormatDate() {
    return this.date[0] ? ExpirationDate.addLeadingZero(this.date[0]) + '/' + this.date[1] : this.date;
  }

  private static addLeadingZero(number: number) {
    return (number < 10 ? '0' : '') + number;
  }
}
