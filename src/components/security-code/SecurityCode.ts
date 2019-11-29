import BinLookup from '../../core/shared/BinLookup';
import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

class SecurityCode extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.SECURITY_CODE_INPUT) as HTMLInputElement;
  private static DISABLED_ATTRIBUTE_CLASS: string = 'st-input--disabled';
  private static DISABLED_ATTRIBUTE_NAME: string = 'disabled';
  private static DISABLED_PARAM: string = 'disabled';
  private static GREY_OUT: string = '0.5';
  private static GREY_OUT_OFF: string = '1';
  private static MATCH_EXACTLY_FOUR_DIGITS: string = '^[0-9]{4}$';
  private static MATCH_EXACTLY_THREE_DIGITS: string = '^[0-9]{3}$';
  private static REQUIRED_PARAM: string = 'required';
  private static SPECIAL_INPUT_LENGTH: number = 4;
  private static STANDARD_INPUT_LENGTH: number = 3;

  private _binLookup: BinLookup;
  private _formatter: Formatter;
  private _securityCodeLength: number;
  private _securityCodeWrapper: HTMLElement;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE, Selectors.SECURITY_CODE_LABEL);
    this._binLookup = new BinLookup();
    this._formatter = new Formatter();
    this._subscribeSecurityCodeChange();
    this._securityCodeWrapper = document.getElementById(Selectors.SECURITY_CODE_INPUT_SELECTOR) as HTMLElement;
    this._securityCodeLength = SecurityCode.STANDARD_INPUT_LENGTH;
    this._init();
  }

  public getLabel(): string {
    return Language.translations.LABEL_SECURITY_CODE;
  }

  protected onBlur() {
    super.onBlur();
    this._sendState();
    this._broadcastFocusEvent(false, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this._sendState();
    this._broadcastFocusEvent(true, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._setInputValue();
    this.validation.keepCursorAtSamePosition(this._inputElement);
    this._sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._setInputValue();
    this._sendState();
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
  }

  private _setInputValue() {
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._securityCodeLength);
    this._inputElement.value = this._formatter.code(
      this._inputElement.value,
      this._securityCodeLength,
      Selectors.SECURITY_CODE_INPUT
    );
  }

  private _init() {
    super.setEventListener(MessageBus.EVENTS.FOCUS_SECURITY_CODE, false);
    super.setEventListener(MessageBus.EVENTS.BLUR_SECURITY_CODE);
    this._subscribeSecurityCodeChange();
    this._setSecurityCodePattern(SecurityCode.MATCH_EXACTLY_THREE_DIGITS);
    this._setDisableListener();
    this._disableSecurityCodeListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
    );
  }

  private _broadcastFocusEvent(data: boolean, eventType: string) {
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS.FOCUS_SECURITY_CODE
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _sendState() {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE);
    this._messageBus.publish(messageBusEvent);
  }

  private _setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_SECURITY_CODE, (state: boolean) => {
      return this._isSecurityCodeWrapperDisabled(state)
        ? this._disableSecurityCodeInput
        : this._enableSecurityCodeInput();
    });
  }

  private _isSecurityCodeWrapperDisabled(state: boolean): boolean {
    return state || this._securityCodeWrapper.style.opacity === SecurityCode.GREY_OUT;
  }

  private _disableSecurityCodeInput() {
    this._inputElement.setAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME, SecurityCode.DISABLED_ATTRIBUTE_NAME);
    this._inputElement.classList.add(SecurityCode.DISABLED_ATTRIBUTE_CLASS);
  }

  private _enableSecurityCodeInput() {
    this._inputElement.removeAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME);
    this._inputElement.classList.remove(SecurityCode.DISABLED_ATTRIBUTE_CLASS);
  }

  private _setSecurityCodeProperties(length: number, pattern: string) {
    this._securityCodeLength = length;
    this._setSecurityCodePattern(pattern);
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._securityCodeLength);
  }

  private _checkSecurityCodeLength(length: number) {
    return length === SecurityCode.SPECIAL_INPUT_LENGTH
      ? this._setSecurityCodeProperties(length, SecurityCode.MATCH_EXACTLY_FOUR_DIGITS)
      : this._setSecurityCodeProperties(length, SecurityCode.MATCH_EXACTLY_THREE_DIGITS);
  }

  private _subscribeSecurityCodeChange() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, (length: number) => {
      this._checkSecurityCodeLength(length);
      this._sendState();
    });
  }

  private _clearInputValue() {
    this._inputElement.value = '';
  }

  private _disableSecurityCodeListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.DISABLE_SECURITY_CODE, (data: boolean) => {
      this._toggleSecurityCodeValidation();
      this._toggleSecurityCode(data);
    });
  }

  private _toggleSecurityCodeValidation() {
    this.validation.removeError(this._inputElement, this._messageElement);
    this._inputElement.setCustomValidity('');
  }

  private _disableSecurityCode() {
    this._inputElement.removeAttribute(SecurityCode.REQUIRED_PARAM);
    this._inputElement.disabled = true;
  }

  private _enableSecurityCode() {
    this._inputElement.removeAttribute(SecurityCode.DISABLED_PARAM);
    this._inputElement.setAttribute(SecurityCode.REQUIRED_PARAM, SecurityCode.REQUIRED_PARAM);
  }

  private _setSecurityCodePattern(securityCodePattern: string) {
    this.setAttributes({ pattern: securityCodePattern });
  }

  private _toggleSecurityCodeWrapper(state: string) {
    this._securityCodeWrapper.style.opacity = state;
  }

  private _toggleSecurityCode(disable: boolean) {
    if (disable) {
      this._clearInputValue();
      this._disableSecurityCode();
      this._toggleSecurityCodeValidation();
      this._toggleSecurityCodeWrapper(SecurityCode.GREY_OUT);
    } else {
      this._enableSecurityCode();
      this._toggleSecurityCodeWrapper(SecurityCode.GREY_OUT_OFF);
      this._inputElement.classList.remove(SecurityCode.DISABLED_ATTRIBUTE_CLASS);
    }
  }
}

export default SecurityCode;
