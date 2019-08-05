import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class ExpirationDate extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static BACKSPACE_KEY_CODE: number = 8;
  private static BLOCKS: number[] = [2, 2];
  private static DELETE_KEY_CODE: number = 46;
  private static DISABLE_FIELD_CLASS: string = 'st-input--disabled';
  private static DISABLE_STATE: string = 'disabled';
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

  /**
   * Formats indicated string to date in format: mm/yy.
   */
  private static _getISOFormatDate(previousDate: string[], currentDate: string[]) {
    const currentDateMonth = currentDate[0];
    const currentDateYear = currentDate[1];
    const previousDateYear = previousDate[1];

    if (!currentDateMonth.length) {
      return '';
    } else if (currentDateMonth.length && currentDateYear.length === 0) {
      return currentDateMonth;
    } else if (currentDateMonth.length === 2 && currentDateYear.length === 1 && previousDateYear.length === 0) {
      return currentDateMonth + '/' + currentDateYear;
    } else if (
      (currentDateMonth.length === 2 &&
        currentDateYear.length === 1 &&
        (previousDateYear.length === 1 || previousDateYear.length === 2)) ||
      (currentDateMonth.length === 2 && currentDateYear.length === 2)
    ) {
      return currentDateMonth + '/' + currentDateYear;
    }
  }

  private _currentKeyCode: number;
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
    this._setFormattedDate();
    this._sendState();
  }

  /**
   * Triggers event when user is releasing key.
   * @param event
   */
  protected onKeydown(event: KeyboardEvent) {
    super.onKeydown(event);
    this._currentKeyCode = event.keyCode;
    this._inputSelectionStart = this._inputElement.selectionStart;
    this._inputSelectionEnd = this._inputElement.selectionEnd;
    return event;
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
   * Returns fixed date in array.
   * @param value
   */
  private _getFixedDateString(value: string) {
    let date: string[];
    let month;
    let year;
    month = value.slice(0, 2);
    year = value.slice(2, 4);
    date = [month, year];
    return ExpirationDate._getISOFormatDate(this._date, date);
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
   * Checks whether pressed key is 'Backspace' or 'Delete'.
   * @private
   */
  private _isPressedKeyDelete(): boolean {
    return (
      this._currentKeyCode === ExpirationDate.DELETE_KEY_CODE ||
      this._currentKeyCode === ExpirationDate.BACKSPACE_KEY_CODE
    );
  }

  /**
   * Returns validated date or empty value if nothing's indicated.
   * @param validatedDate
   * @private
   */
  private _returnValidatedDate(validatedDate: any) {
    return (this._inputElement.value = validatedDate ? validatedDate : this._inputElement.value);
  }

  /**
   * Propagates expiration date change to MessageBus
   * @private
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
    this._returnValidatedDate(validatedDate);
    if (this._isPressedKeyDelete()) {
      this._inputElement.setSelectionRange(this._inputSelectionStart, this._inputSelectionEnd);
    }
    return validatedDate;
  }
}
