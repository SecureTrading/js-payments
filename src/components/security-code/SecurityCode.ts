import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class SecurityCode extends FormField {
  // @ts-ignore
  public static ifFieldExists = (): HTMLInputElement => document.getElementById(Selectors.SECURITY_CODE_INPUT);
  private static INPUT_LENGTH: number = 3;
  private static PLACEHOLDER_VALUE: any = { 3: 'XXX', 4: 'XXXX' };

  public binLookup: BinLookup;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE);
    this.binLookup = new BinLookup();

    this.sendState();
    this.setSecurityCodeAttributes();
    this.subscribeSecurityCodeChange();
  }

  protected onBlur(event: FocusEvent) {
    super.onBlur(event);
    this.sendState();
  }

  protected onFocus(event: FocusEvent) {
    super.onFocus(event);
    this.sendState();
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
  }

  private sendState() {
    if (this._inputElement.value) {
      const formFieldState: IFormFieldState = this.getState();
      const messageBusEvent: IMessageBusEvent = {
        data: formFieldState,
        type: MessageBus.EVENTS.CHANGE_SECURITY_CODE
      };
      this._messageBus.publish(messageBusEvent);
    }
  }

  /**
   * Listens to Security Code length change event,
   */
  private subscribeSecurityCodeChange() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, (data: any) =>
      this.setSecurityCodeAttributes(data)
    );
  }

  /**
   * Sets values of Security Code field (maxlength, minlength and placeholder) according to data form BinLookup.
   * If length is not specified it takes 3 as length.
   * @param securityCodeLength
   */
  private setSecurityCodeAttributes(securityCodeLength: number = SecurityCode.INPUT_LENGTH) {
    this.setAttributes({
      maxlength: securityCodeLength,
      minlength: securityCodeLength,
      placeholder: SecurityCode.PLACEHOLDER_VALUE[securityCodeLength]
    });
  }
}
