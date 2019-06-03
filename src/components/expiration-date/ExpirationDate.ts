import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
export default class ExpirationDate extends FormField {
  public static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.EXPIRATION_DATE_INPUT);
  }

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
    this.backendValidation();
  }

  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  public backendValidation() {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD, (data: any) => {
      this.checkBackendValidity(data);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }

  public setFocusListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, () => {
      this.format(this._inputElement.value);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }

  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_EXPIRATION_DATE, (state: boolean) => {
      if (state) {
        // @ts-ignore
        this._inputElement.setAttribute('disabled', state);
        this._inputElement.classList.add('st-input--disabled');
      } else {
        // @ts-ignore
        this._inputElement.removeAttribute('disabled');
        this._inputElement.classList.remove('st-input--disabled');
      }
    });
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._inputElement.value = Formatter.trimNonNumericExceptSlash(this._inputElement.value);
    if (this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH) {
      this._inputElement.value = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
      this.validation.validate(this._inputElement, this._messageElement);
    }
    this.sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
  }

  protected onBlur() {
    super.onBlur();
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    const preparedValue = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
    this._inputElement.value = Formatter.maskExpirationDateOnPaste(preparedValue);
    this.sendState();
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    if (this.isMaxLengthReached()) {
      event.preventDefault();
    }
  }

  protected format(data: string) {
    this.setValue(Formatter.maskExpirationDate(data));
  }

  private isMaxLengthReached = (): boolean => this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH;

  private sendState() {
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
  }
}
