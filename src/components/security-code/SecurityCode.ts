import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class SecurityCode extends FormField {
  // @ts-ignore
  public static ifFieldExists = (): HTMLInputElement => document.getElementById(Selectors.SECURITY_CODE_INPUT);
  private static STANDARD_INPUT_LENGTH: number = 3;
  private static STANDARD_LENGTH_PATTERN: string = '^[0-9]{3}$';
  private static SPECIAL_LENGTH_PATTERN: string = '^[0-9]{4}$';

  public binLookup: BinLookup;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE, Selectors.SECURITY_CODE_LABEL);
    this.binLookup = new BinLookup();
    this.setSecurityCodeAttributes(SecurityCode.STANDARD_INPUT_LENGTH, SecurityCode.STANDARD_LENGTH_PATTERN);

    if (this._inputElement.value) {
      this.sendState();
    }
    this.subscribeSecurityCodeChange();
    this.backendValidation();
  }

  public getLabel(): string {
    return Language.translations.LABEL_SECURITY_CODE;
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
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Listens to Security Code length change event,
   */
  private subscribeSecurityCodeChange() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, (length: any) => {
      let securityCodeLength = length;
      let securityCodePattern = SecurityCode.STANDARD_LENGTH_PATTERN;
      if (securityCodeLength !== SecurityCode.STANDARD_INPUT_LENGTH) {
        securityCodePattern = SecurityCode.SPECIAL_LENGTH_PATTERN;
      }
      this.setSecurityCodeAttributes(securityCodeLength, securityCodePattern);
    });
  }

  /**
   * Sets values of Security Code field (maxlength, minlength and placeholder) according to data form BinLookup.
   * If length is not specified it takes 3 as length.
   * @param securityCodeLength
   * @param securityCodePattern
   */
  private setSecurityCodeAttributes(securityCodeLength: number, securityCodePattern: string) {
    this.setAttributes({
      maxlength: securityCodeLength,
      pattern: securityCodePattern
    });
  }

  public backendValidation() {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD, (data: any) => {
      this.checkBackendValidity(data);
    });
  }
}
