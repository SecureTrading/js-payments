import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
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
  private static INPUT_MAX_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE);

    this.setAttributes({
      maxlength: ExpirationDate.INPUT_MAX_LENGTH,
      pattern: ExpirationDate.INPUT_PATTERN
    });

    if (this._inputElement.value) {
      this.sendState();
    }
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
    this.sendState();
  }

  protected format(data: string) {
    this.setValue(Formatter.maskExpirationDate(data));
  }

  private sendState() {
    const formFieldState: FormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
  }
}
