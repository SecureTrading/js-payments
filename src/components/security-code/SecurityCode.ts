import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/Formatter';
import { FormField } from '../../core/shared/FormField';
import { Language } from '../../core/shared/Language';
import { MessageBus } from '../../core/shared/MessageBus';
import { Selectors } from '../../core/shared/Selectors';
import { Validation } from '../../core/shared/Validation';

export class SecurityCode extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.SECURITY_CODE_INPUT) as HTMLInputElement;
  private static CLEAR_VALUE: string = '';
  private static DISABLED_ATTRIBUTE: string = 'disabled';
  private static DISABLED_CLASS: string = 'st-input--disabled';
  private static DISABLED_PARAM: string = 'disabled';
  private static MATCH_EXACTLY_FOUR_DIGITS: string = '^[0-9]{4}$';
  private static MATCH_EXACTLY_THREE_DIGITS: string = '^[0-9]{3}$';
  private static SPECIAL_INPUT_LENGTH: number = 4;
  private static STANDARD_INPUT_LENGTH: number = 3;

  private _formatter: Formatter;
  private _securityCodeLength: number;
  private _securityCodeWrapper: HTMLElement;
  private _validation: Validation;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE, Selectors.SECURITY_CODE_LABEL);
    this._formatter = new Formatter();
    this._validation = new Validation();
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
    this._broadcastEvent(false, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this._sendState();
    this._broadcastEvent(true, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._setInputValue();
    this.validation.keepCursorsPosition(this._inputElement);
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
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
    );
  }

  private _broadcastEvent(data: boolean, eventType: string) {
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: eventType
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _sendState() {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE);
    this.messageBus.publish(messageBusEvent);
  }

  private _setDisableListener() {
    this.messageBus.subscribe(MessageBus.EVENTS.BLOCK_SECURITY_CODE, (state: boolean) => {
      this._toggleSecurityCode(state);
    });
  }

  private _setSecurityCodeProperties(length: number, pattern: string) {
    this._securityCodeLength = length;
    this._setSecurityCodePattern(pattern);
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._securityCodeLength);
  }

  private _checkSecurityCodeLength(length: number) {
    if (length === SecurityCode.SPECIAL_INPUT_LENGTH) {
      this._setSecurityCodeProperties(length, SecurityCode.MATCH_EXACTLY_FOUR_DIGITS);
    } else if (length === SecurityCode.STANDARD_INPUT_LENGTH) {
      this._setSecurityCodeProperties(length, SecurityCode.MATCH_EXACTLY_THREE_DIGITS);
    }
  }

  private _subscribeSecurityCodeChange() {
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, (length: number) => {
      this._checkSecurityCodeLength(length);
      this._sendState();
    });

    this.messageBus.subscribe(MessageBus.EVENTS.IS_CARD_WITHOUT_CVV, (state: boolean) => {
      if (state) {
        this._clearInputValue();
      }
      this._toggleSecurityCode(state);
    });
  }

  private _clearInputValue() {
    this._inputElement.value = SecurityCode.CLEAR_VALUE;
  }

  private _toggleSecurityCodeValidation() {
    this.validation.removeError(this._inputElement, this._messageElement);
    this._inputElement.setCustomValidity(SecurityCode.CLEAR_VALUE);
  }

  private _disableSecurityCode() {
    this._inputElement.setAttribute(SecurityCode.DISABLED_ATTRIBUTE, SecurityCode.DISABLED_PARAM);
    this._inputElement.classList.add(SecurityCode.DISABLED_CLASS);
  }

  private _enableSecurityCode() {
    this._inputElement.removeAttribute(SecurityCode.DISABLED_ATTRIBUTE);
    this._inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
  }

  private _setSecurityCodePattern(securityCodePattern: string) {
    this.setAttributes({ pattern: securityCodePattern });
  }

  private _toggleSecurityCode(disabled: boolean) {
    if (disabled) {
      this._disableSecurityCode();
      this._toggleSecurityCodeValidation();
    } else {
      this._enableSecurityCode();
      this._inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
    }
  }
}
