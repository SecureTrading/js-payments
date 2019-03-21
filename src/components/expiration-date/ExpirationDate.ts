import FormField from '../../core/shared/FormField';
import Selectors from '../../core/shared/Selectors';
import Formatter from '../../core/shared/Formatter';
import MessageBus from '../../core/shared/MessageBus';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
export default class ExpirationDate extends FormField {
  private static INPUT_MAX_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';
  private messageBus: MessageBus;

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT_SELECTOR, Selectors.EXPIRATION_DATE_MESSAGE_SELECTOR);

    this.messageBus = new MessageBus();

    this.setAttributes({
      maxlength: ExpirationDate.INPUT_MAX_LENGTH,
      pattern: ExpirationDate.INPUT_PATTERN
    });

    if (this._inputElement.value) {
      this.sendState();
    }
  }

  static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.EXPIRATION_DATE_INPUT_SELECTOR);
  }

  private sendState() {
    let formFieldState: FormFieldState = this.getState();
    let messageBusEvent: MessageBusPublishEvent = {
      type: MessageBus.EVENTS.EXPIRATION_DATE_CHANGE,
      data: formFieldState
    };
    this.messageBus.publish(messageBusEvent);
  }

  onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
  }

  format(data: string) {
    let dataFormatted = Formatter.maskExpirationDate(data);
    this.setValue(dataFormatted);
  }
}
