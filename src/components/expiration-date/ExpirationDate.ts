import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

class ExpirationDate extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static BLOCKS: number[] = [2, 2];
  private static DISABLE_FIELD_CLASS: string = 'st-input--disabled';
  private static DISABLE_STATE: string = 'disabled';
  private static ESCAPE_DIGITS_REGEXP: RegExp = /[^\d]/g;
  private static EXPIRATION_DATE_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private static _clearNonDigitsChars = (value: string) => {
    return value.replace(ExpirationDate.ESCAPE_DIGITS_REGEXP, '');
  };

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
    } else {
      return '';
    }
  }

  private _currentKeyCode: number;
  private _date: string[] = ['', ''];
  private _formatter: Formatter;
  private _inputSelectionEnd: number;
  private _inputSelectionStart: number;

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);
    this._formatter = new Formatter();
    this._init();
  }

  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_EXPIRATION_DATE, (state: boolean) => {
      state ? this._disableInputField() : this._enableInputField();
    });
  }

  protected setBlurListener() {
    super.setEventListener(MessageBus.EVENTS.BLUR_EXPIRATION_DATE);
  }

  protected setFocusListener() {
    super.setEventListener(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, false);
  }

  protected format(date: string) {
    this.setValue(date);
  }

  protected onBlur() {
    super.onBlur();
    this._setInputValue(this._inputElement.value, ExpirationDate.EXPIRATION_DATE_LENGTH);
    this._sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this._setInputValue(this._inputElement.value, ExpirationDate.EXPIRATION_DATE_LENGTH);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._setInputValue(this._inputElement.value, ExpirationDate.EXPIRATION_DATE_LENGTH);
    this._setFormattedDate();
    this.validation.keepCursorAtSamePosition(this._inputElement);
    this._sendState();
  }

  protected onKeydown(event: KeyboardEvent) {
    super.onKeydown(event);
    this._currentKeyCode = event.keyCode;
    this._inputSelectionStart = this._inputElement.selectionStart;
    this._inputSelectionEnd = this._inputElement.selectionEnd;
    return event;
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    this._inputElement.focus();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._setInputValue(this._inputElement.value, ExpirationDate.EXPIRATION_DATE_LENGTH);
    this._setFormattedDate();
    this._sendState();
  }

  private _init() {
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this.setBlurListener();
    this.setDisableListener();
    this.setFocusListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
    );
  }

  private _getFixedDateString(value: string) {
    let date: string[];
    let month;
    let year;
    month = value.slice(0, 2);
    year = value.slice(2, 4);
    date = [month, year];
    return ExpirationDate._getISOFormatDate(this._date, date);
  }

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

  private _returnValidatedDate(validatedDate: any) {
    return (this._inputElement.value = validatedDate ? validatedDate : this._inputElement.value);
  }

  private _sendState() {
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _setFormattedDate() {
    const validatedDate = this._getValidatedDate(this._inputElement.value);
    this._returnValidatedDate(validatedDate);
    return validatedDate;
  }

  private _setInputValue(value: string, length: number) {
    this._inputElement.value = this.validation.limitLength(value, length);
  }

  private _disableInputField() {
    this._inputElement.setAttribute(ExpirationDate.DISABLE_STATE, 'true');
    this._inputElement.classList.add(ExpirationDate.DISABLE_FIELD_CLASS);
  }

  private _enableInputField() {
    this._inputElement.removeAttribute(ExpirationDate.DISABLE_STATE);
    this._inputElement.classList.remove(ExpirationDate.DISABLE_FIELD_CLASS);
  }
}

export default ExpirationDate;
