import BinLookup from '../../core/shared/BinLookup';
import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class SecurityCode extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.SECURITY_CODE_INPUT) as HTMLInputElement;

  private static DISABLED_ATTRIBUTE_CLASS: string = 'st-input--disabled';
  private static DISABLED_ATTRIBUTE_NAME: string = 'disabled';
  private static SPECIAL_INPUT_LENGTH: number = 4;
  private static STANDARD_INPUT_LENGTH: number = 3;
  private static MATCH_EXACTLY_THREE_DIGITS: string = '^[0-9]{3}$';
  private static MATCH_EXACTLY_FOUR_DIGITS: string = '^[0-9]{4}$';

  public binLookup: BinLookup;

  private securityCodeLength: number;
  private _formatter: Formatter;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE, Selectors.SECURITY_CODE_LABEL);
    this.securityCodeLength = SecurityCode.STANDARD_INPUT_LENGTH;
    this.binLookup = new BinLookup();
    this._formatter = new Formatter();
    this._setSecurityCodePattern(SecurityCode.MATCH_EXACTLY_THREE_DIGITS);
    this._subscribeSecurityCodeChange();
    this.setBlurListener();
    this.setFocusListener();
    this.setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
    );
  }

  /**
   * Gets translated label content.
   */
  public getLabel(): string {
    return Language.translations.LABEL_SECURITY_CODE;
  }

  /**
   * Listens to event which controls blocking input components.
   */
  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_SECURITY_CODE, (state: boolean) => {
      if (state) {
        // @ts-ignore
        this._inputElement.setAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME, state);
        this._inputElement.classList.add(SecurityCode.DISABLED_ATTRIBUTE_CLASS);
      } else {
        // @ts-ignore
        this._inputElement.removeAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME);
        this._inputElement.classList.remove(SecurityCode.DISABLED_ATTRIBUTE_CLASS);
      }
    });
  }

  /**
   * Sets focus listener, controls focusing on input field.
   */
  protected setFocusListener() {
    super.setEventListener(MessageBus.EVENTS.FOCUS_SECURITY_CODE, false);
  }

  /**
   * Sets blur listener, controls blurring on input field.*
   */
  protected setBlurListener() {
    super.setEventListener(MessageBus.EVENTS.BLUR_SECURITY_CODE);
  }

  /**
   * Extended parents method.
   * Controls blur event.
   */
  protected onBlur() {
    super.onBlur();
    this._sendState();
    const messageBusEvent: IMessageBusEvent = {
      data: false,
      type: MessageBus.EVENTS.FOCUS_SECURITY_CODE
    };
    this.validation.validate(this._inputElement, this._messageElement);
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Extended parents method.
   * Controls focus event.
   * @param event
   */
  protected onFocus(event: Event) {
    super.onFocus(event);
    this._sendState();
    const messageBusEvent: IMessageBusEvent = {
      data: true,
      type: MessageBus.EVENTS.FOCUS_SECURITY_CODE
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Extended parents method.
   * Controls input event.
   * @param event
   */
  protected onInput(event: Event) {
    super.onInput(event);
    this._inputElement.value = this._formatter.code(
      this._inputElement.value,
      this.securityCodeLength,
      Selectors.SECURITY_CODE_INPUT
    );
    this._sendState();
  }

  /**
   * Extended parents method.
   * Controls paste event.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._inputElement.value = this._inputElement.value.substring(0, this.securityCodeLength);
    this._sendState();
  }

  /**
   * Extended parents method.
   * Controls onKeyPress event.
   * @param event
   */
  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
  }

  /**
   * Inherited and extended function from parent class.
   * Sets communication with MessageBus.
   * @private
   */
  private _sendState() {
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Listens to Security Code length change event,
   * @private
   */
  private _subscribeSecurityCodeChange() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, (length: number) => {
      let securityCodePattern = SecurityCode.MATCH_EXACTLY_THREE_DIGITS;
      this.securityCodeLength = SecurityCode.STANDARD_INPUT_LENGTH;
      if (length === SecurityCode.SPECIAL_INPUT_LENGTH) {
        securityCodePattern = SecurityCode.MATCH_EXACTLY_FOUR_DIGITS;
        this.securityCodeLength = SecurityCode.SPECIAL_INPUT_LENGTH;
      }
      this._setSecurityCodePattern(securityCodePattern);
      return securityCodePattern;
    });
  }

  /**
   * Sets values of Security Code field (maxlength, minlength and placeholder) according to data form BinLookup.
   * If length is not specified it takes 3 as length.
   * @param securityCodePattern
   * @private
   */
  private _setSecurityCodePattern(securityCodePattern: string) {
    this.setAttributes({ pattern: securityCodePattern });
  }
}
