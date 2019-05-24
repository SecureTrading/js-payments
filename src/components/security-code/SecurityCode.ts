import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class SecurityCode extends FormField {
  // @ts-ignore
  public static ifFieldExists = (): HTMLInputElement => document.getElementById(Selectors.SECURITY_CODE_INPUT);
  private static STANDARD_INPUT_LENGTH: number = 3;
  private static SPECIAL_INPUT_LENGTH: number = 4;
  private static STANDARD_LENGTH_PATTERN: string = '^[0-9]{3}$';
  private static SPECIAL_LENGTH_PATTERN: string = '^[0-9]{4}$';

  public binLookup: BinLookup;
  private securityCodeLength: number;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE, Selectors.SECURITY_CODE_LABEL);
    this.securityCodeLength = 3;
    this.binLookup = new BinLookup();
    this.setSecurityCodeAttributes(SecurityCode.STANDARD_LENGTH_PATTERN);

    if (this._inputElement.value) {
      this.sendState();
    }
    this.subscribeSecurityCodeChange();
    this.setFocusListener();
    this.setDisableListener();
    this.backendValidation();
  }

  public getLabel(): string {
    return Language.translations.LABEL_SECURITY_CODE;
  }

  protected onBlur() {
    super.onBlur();
    this.sendState();
  }

  protected onFocus(event: FocusEvent) {
    super.onFocus(event);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    if (this._inputElement.value.length >= this.securityCodeLength) {
      this.validation.validate(this._inputElement, this._messageElement);
    }
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    if (this.isMaxLengthReached()) {
      this._inputElement.value = this._inputElement.value.substring(0, this.securityCodeLength);
    }
    this.sendState();
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    if (this.isMaxLengthReached()) {
      event.preventDefault();
    }
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
      let securityCodePattern = SecurityCode.STANDARD_LENGTH_PATTERN;
      this.securityCodeLength = SecurityCode.STANDARD_INPUT_LENGTH;
      if (length === SecurityCode.SPECIAL_INPUT_LENGTH) {
        securityCodePattern = SecurityCode.SPECIAL_LENGTH_PATTERN;
        this.securityCodeLength = SecurityCode.SPECIAL_INPUT_LENGTH;
      }
      this.setSecurityCodeAttributes(securityCodePattern);
      return securityCodePattern;
    });
  }

  /**
   * Sets values of Security Code field (maxlength, minlength and placeholder) according to data form BinLookup.
   * If length is not specified it takes 3 as length.
   * @param securityCodePattern
   */
  private setSecurityCodeAttributes(securityCodePattern: string) {
    this.setAttributes({ pattern: securityCodePattern });
  }

  /**
   *
   */
  private isMaxLengthReached = () => this._inputElement.value.length >= this.securityCodeLength;

  public backendValidation() {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD, (data: any) => {
      this.checkBackendValidity(data);
    });
  }

  public setFocusListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.FOCUS_SECURITY_CODE, () => {
      this.format(this._inputElement.value);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }

  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_SECURITY_CODE, (state: boolean) => {
      // @ts-ignore
      this._inputElement.setAttribute('disabled', state);
      this._inputElement.classList.add('st-input--disabled');
    });
  }
}
