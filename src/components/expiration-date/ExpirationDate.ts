import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class ExpirationDate extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static BLOCKS = [2, 2];
  private static DISABLE_FIELD_CLASS = 'st-input--disabled';
  private static DISABLE_STATE = 'disabled';
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';
  private static ONLY_DIGITS_REGEXP = /[^\d]/g;

  /**
   * Filters the non-digits from given string.
   * @param value
   * @private
   */
  private static _clearNonDigitsChars = (value: string) => {
    return value.replace(ExpirationDate.ONLY_DIGITS_REGEXP, '');
  };

  private _date: string[] = ['', ''];
  private _inputSelectionStart: number;
  private _inputSelectionEnd: number;

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this.setBlurListener();
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
   * Sets focus listener, controls focusing on input field.
   */
  protected setFocusListener() {
    super.setEventListener(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE);
  }

  /**
   * Sets blur listener, controls blurring on input field.*
   */
  protected setBlurListener() {
    super.setEventListener(MessageBus.EVENTS.BLUR_EXPIRATION_DATE);
  }

  /**
   * Formats indicated date using mask.
   * @param date
   */
  protected format(date: string) {
    this.setValue(date);
  }

  /**
   * Extends onBlur method and triggers _sendState().
   */
  protected onBlur() {
    super.onBlur();
    this._sendState();
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS.FOCUS_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
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
    this._inputElement.value = Formatter.trimNonNumeric(this._inputElement.value);
    this._inputSelectionStart = this._inputElement.selectionStart;
    this._inputSelectionEnd = this._inputElement.selectionEnd;
    this._setFormattedDate();
    this._inputElement.setSelectionRange(this._inputSelectionStart, this._inputSelectionEnd);
    this._sendState();
  }

  /**
   * Extends onKeyPress event with max length check.
   * @param event
   */
  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    this._inputElement.focus();
  }

  /**
   * Extends onPaste method with formatting and masking.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._setFormattedDate();
    this._sendState();
  }

  /**
   * Propagates expiration date change to MessageBus
   */
  private _sendState() {
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
    const validatedDate = this._getValidatedDate(this._inputElement.value);
    this._inputElement.value = validatedDate ? validatedDate : this._inputElement.value;
    return validatedDate;
  }

  /**
   * Validates indicated string.
   * @param value
   * @private
   */
  private _getValidatedDate(value: string) {
    let date: string = ExpirationDate._clearNonDigitsChars(value);
    let result: string = '';

    ExpirationDate.BLOCKS.forEach(length => {
      if (date.length > 0) {
        const sub = date.slice(0, length);
        const rest = date.slice(length);
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
    let date: string[];
    let month;
    let year;
    month = value.slice(0, 2);
    year = value.slice(2, 4);
    date = [month, year];
    return this._getISOFormatDate(this._date, date);
  }

  /**
   * Formats indicated string to date in format: mm/yy.
   */
  private _getISOFormatDate(previousDate: string[], currentDate: string[]) {
    this._date = currentDate;
    // @ts-ignore
    if (currentDate[0].length === 2 && currentDate[1].length === 0 && previousDate[1].length === 0) {
      this._inputSelectionEnd = this._inputSelectionEnd + 1;
      this._inputSelectionStart = this._inputSelectionStart + 1;
      return currentDate[0] + '/';
    } else if (currentDate[0].length === 2 && currentDate[1].length === 0 && previousDate[1].length === 1) {
      return currentDate[0];
    } else if (currentDate[0] && currentDate[1]) {
      return currentDate[0] + '/' + currentDate[1];
    } else {
      return '';
    }
  }
}
