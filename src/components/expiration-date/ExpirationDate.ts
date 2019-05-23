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

  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private static EXPIRATION_DATE_LENGTH: number = 5;

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);

    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });

    if (this._inputElement.value) {
      this.sendState();
    }
    this.setFocusListener();
    this.backendValidation();
  }

  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    if (this.isMaxLengthReached()) {
      this._inputElement.value = Formatter.maskExpirationDate(
        this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH)
      );
    }
    this.sendState();
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    if (this.isMaxLengthReached()) {
      event.preventDefault();
    }
  }

  private isMaxLengthReached = () => this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH;

  // private isDateFromThePast = () => {
  //   let date = new Date();
  //   let monthExpected = ('0' + (date.getMonth() + 1)).slice(-2);
  //   let yearExpected = date
  //     .getFullYear()
  //     .toString()
  //     .substr(-2);
  //   const month = this._inputElement.value.substring(0, 2);
  //   const year = this._inputElement.value.slice(-2);
  // };

  protected format(data: string) {
    this.setValue(Formatter.maskExpirationDate(data));
  }

  private sendState() {
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
  }

  public backendValidation() {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD, (data: any) => {
      this.checkBackendValidity(data);
    });
  }

  public setFocusListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, () => {
      this.format(this._inputElement.value);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }
}
