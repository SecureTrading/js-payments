import { FormState } from '../../core/models/constants/FormState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/Formatter';
import { Input } from '../../core/shared/input/Input';
import { Language } from '../../core/shared/Language';
import { MessageBus } from '../../core/shared/MessageBus';
import { Selectors } from '../../core/shared/Selectors';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../shared/services/config/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/Styler';
import { Frame } from '../../core/shared/frame/Frame';

@Service()
export class ExpirationDate extends Input {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static DISABLED_ATTRIBUTE: string = 'disabled';
  private static DISABLED_CLASS: string = 'st-input--disabled';
  private static EXPIRATION_DATE_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  private _currentKeyCode: number;
  private _inputSelectionEnd: number;
  private _inputSelectionStart: number;

  constructor(
    private _configProvider: ConfigProvider,
    private _formatter: Formatter,
    private messageBus: MessageBus,
    private frame: Frame
  ) {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);
    this._init();
    this._configProvider.getConfig$().subscribe((config: IConfig) => {
      const styler: Styler = new Styler(this.getAllowedStyles(), this.frame.parseUrl().styles);
      if (styler.isLinedUp(config.styles.expirationDate)) {
        styler.lineUp(
          'st-expiration-date',
          'st-expiration-date-label',
          ['st-expiration-date', 'st-expiration-date--lined-up'],
          ['expiration-date__label', 'expiration-date__label--required', 'lined-up']
        );
      }
    });
  }

  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  public setDisableListener() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE, (state: FormState) => {
      state !== FormState.AVAILABLE ? this._disableInputField() : this._enableInputField();
    });
  }

  protected format(date: string) {
    this.setValue(date);
  }

  protected onBlur() {
    super.onBlur();
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
    this._sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._inputElement.value = this.validation.limitLength(
      this._inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
    this.validation.keepCursorsPosition(this._inputElement);
    this._sendState();
  }

  protected onKeydown(event: KeyboardEvent) {
    super.onKeydown(event);
    this._currentKeyCode = event.keyCode;
    this._inputSelectionStart = this._inputElement.selectionStart;
    this._inputSelectionEnd = this._inputElement.selectionEnd;
    return event;
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    this._inputElement.focus();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._inputElement.value = this.validation.limitLength(
      this._inputElement.value,
      ExpirationDate.EXPIRATION_DATE_LENGTH
    );
    this._inputElement.value = this._formatter.date(this._inputElement.value, Selectors.EXPIRATION_DATE_INPUT);
    this._sendState();
  }

  private _init() {
    super.setEventListener(MessageBus.EVENTS.BLUR_EXPIRATION_DATE);
    super.setEventListener(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE);
    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });
    this.placeholder = this._configProvider.getConfig().placeholders.expirydate || '';
    this._inputElement.setAttribute(ExpirationDate.PLACEHOLDER_ATTRIBUTE, this.placeholder);
    this.setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
    );
  }

  private _sendState() {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE);
    this.messageBus.publish(messageBusEvent);
  }

  private _disableInputField() {
    this._inputElement.setAttribute(ExpirationDate.DISABLED_ATTRIBUTE, 'true');
    this._inputElement.classList.add(ExpirationDate.DISABLED_CLASS);
  }

  private _enableInputField() {
    this._inputElement.removeAttribute(ExpirationDate.DISABLED_ATTRIBUTE);
    this._inputElement.classList.remove(ExpirationDate.DISABLED_CLASS);
  }
}
