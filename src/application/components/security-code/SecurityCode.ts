import { FormState } from '../../core/models/constants/FormState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { LABEL_SECURITY_CODE } from '../../core/models/constants/Translations';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import {
  SECURITY_CODE_INPUT,
  SECURITY_CODE_INPUT_SELECTOR,
  SECURITY_CODE_LABEL,
  SECURITY_CODE_MESSAGE
} from '../../core/models/constants/Selectors';
import { Validation } from '../../core/shared/validation/Validation';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { merge, Observable } from 'rxjs';
import JwtDecode from 'jwt-decode';
import { IDecodedJwt } from '../../core/models/IDecodedJwt';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { DefaultPlaceholders } from '../../core/models/constants/config-resolver/DefaultPlaceholders';
import { LONG_CVC, SHORT_CVC } from '../../core/models/constants/SecurityCode';
import { IConfig } from '../../../shared/model/config/IConfig';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Styler } from '../../core/shared/styler/Styler';
import { Frame } from '../../core/shared/frame/Frame';

@Service()
export class SecurityCode extends Input {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(SECURITY_CODE_INPUT) as HTMLInputElement;
  private static BLOCK_CVV_ATTRIBUTE: string = 'block-cvv';
  private static BLOCK_CVV_VALUE: string = 'true';
  private static CLEAR_VALUE: string = '';
  private static DISABLED_ATTRIBUTE: string = 'disabled';
  private static DISABLED_CLASS: string = 'st-input--disabled';
  private static DISABLED_PARAM: string = 'disabled';
  private static MATCH_EXACTLY_FOUR_DIGITS: string = '^[0-9]{4}$';
  private static MATCH_EXACTLY_THREE_DIGITS: string = '^[0-9]{3}$';

  private _securityCodeLength: number;
  private _securityCodeWrapper: HTMLElement;
  private _validation: Validation;
  private _config: IConfig;

  constructor(
    private _configProvider: ConfigProvider,
    private _localStorage: BrowserLocalStorage,
    private _formatter: Formatter,
    private messageBus: MessageBus,
    private frame: Frame
  ) {
    super(SECURITY_CODE_INPUT, SECURITY_CODE_MESSAGE, SECURITY_CODE_LABEL);
    this._validation = new Validation();
    this._securityCodeWrapper = document.getElementById(SECURITY_CODE_INPUT_SELECTOR) as HTMLElement;
    this._securityCodeLength = SHORT_CVC;
    this.placeholder = this._getPlaceholder(this._securityCodeLength);
    this._configProvider.getConfig$().subscribe((config: IConfig) => {
      const styler: Styler = new Styler(this.getAllowedStyles(), this.frame.parseUrl().styles);
      if (styler.isLinedUp(config.styles.securityCode)) {
        styler.lineUp(
          'st-security-code',
          'st-security-code-label',
          ['st-security-code', 'st-security-code--lined-up'],
          ['security-code__label', 'security-code__label--required', 'lined-up']
        );
      }
    });
    this._securityCodeUpdate$()
      .pipe(filter(Boolean))
      .subscribe((securityCodeLength: number) => {
        this.placeholder = this._getPlaceholder(securityCodeLength);
        this._securityCodeLength = securityCodeLength;
        this.messageBus.publish({
          type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH,
          data: this._securityCodeLength
        });
      });
    this._init();
  }

  private _getPlaceholder(securityCodeLength: number): string {
    if (!this._configProvider.getConfig()) {
      return '***';
    }
    if (
      securityCodeLength === -1 &&
      this._configProvider.getConfig() &&
      this._configProvider.getConfig().placeholders
    ) {
      return this._configProvider.getConfig().placeholders.securitycode
        ? this._configProvider.getConfig().placeholders.securitycode
        : '***';
    }
    if (
      this._configProvider.getConfig().placeholders.securitycode &&
      this._configProvider.getConfig().placeholders.securitycode === DefaultPlaceholders.securitycode
    ) {
      return securityCodeLength === 4 ? '****' : DefaultPlaceholders.securitycode;
    }
    return this._configProvider.getConfig().placeholders.securitycode;
  }

  private _securityCodeUpdate$(): Observable<number> {
    const jwtFromConfig$: Observable<string> = this._configProvider.getConfig$().pipe(map(config => config.jwt));
    const jwtFromUpdate$: Observable<string> = this.messageBus.pipe(
      ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT),
      map(event => event.data.newJwt)
    );
    const cardNumberInput$: Observable<string> = this.messageBus.pipe(
      ofType(MessageBus.EVENTS.CHANGE_CARD_NUMBER),
      map((event: IMessageBusEvent<IFormFieldState>) => event.data.value)
    );
    const cardNumberFromJwt$: Observable<string> = merge(jwtFromConfig$, jwtFromUpdate$).pipe(
      map(jwt => JwtDecode<IDecodedJwt>(jwt).payload.pan)
    );

    const maskedPanFromJsInit$: Observable<string> = this._configProvider.getConfig$().pipe(
      filter((config: IConfig) => config.deferInit === false),
      tap((config: IConfig) => (this._config = config)),
      switchMap(() => this._localStorage.select(store => store['app.maskedpan']))
    );

    return merge(cardNumberInput$, cardNumberFromJwt$, maskedPanFromJsInit$).pipe(
      filter(Boolean),
      map((cardNumber: string) => {
        if (!cardNumber || !iinLookup.lookup(cardNumber).type) {
          return -1;
        }
        if (!iinLookup.lookup(cardNumber).cvcLength[0]) {
          return 4;
        }
        return iinLookup.lookup(cardNumber).cvcLength[0];
      }),
      startWith(-1)
    );
  }

  public getLabel(): string {
    return LABEL_SECURITY_CODE;
  }

  protected onBlur(): void {
    super.onBlur();
    this._sendState();
    this._broadcastEvent(false, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onFocus(event: Event): void {
    super.onFocus(event);
    this._sendState();
    this._broadcastEvent(true, MessageBus.EVENTS.FOCUS_SECURITY_CODE);
  }

  protected onInput(event: Event): void {
    super.onInput(event);
    this._setInputValue();
    this.validation.keepCursorsPosition(this._inputElement);
    this._sendState();
  }

  protected onPaste(event: ClipboardEvent): void {
    super.onPaste(event);
    this._setInputValue();
    this._sendState();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    super.onKeyPress(event);
  }

  private _setInputValue(): void {
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._securityCodeLength);
    this._inputElement.value = this._formatter.code(
      this._inputElement.value,
      this._securityCodeLength,
      SECURITY_CODE_INPUT
    );
  }

  private _init(): void {
    super.setEventListener(MessageBus.EVENTS.FOCUS_SECURITY_CODE, false);
    super.setEventListener(MessageBus.EVENTS.BLUR_SECURITY_CODE);
    this._subscribeSecurityCodeChange();
    this._setDisableListener();
    this._inputElement.setAttribute(SecurityCode.PLACEHOLDER_ATTRIBUTE, this.placeholder);
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
    );
  }

  private _broadcastEvent(data: boolean, eventType: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: eventType
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _sendState(): void {
    const messageBusEvent: IMessageBusEvent = this.setMessageBusEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE);
    this.messageBus.publish(messageBusEvent);
  }

  private _setDisableListener(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE, (state: FormState) => {
      this._toggleSecurityCode(state);
    });
  }

  private _setSecurityCodeProperties(length: number, pattern: string): void {
    this._securityCodeLength = length;
    this._setSecurityCodePattern(pattern);
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._securityCodeLength);
  }

  private _checkSecurityCodeLength(length: number): void {
    if (length === LONG_CVC) {
      this._setSecurityCodeProperties(length, SecurityCode.MATCH_EXACTLY_FOUR_DIGITS);
    } else if (length === SHORT_CVC) {
      this._setSecurityCodeProperties(length, SecurityCode.MATCH_EXACTLY_THREE_DIGITS);
    } else {
      this._setSecurityCodeProperties(LONG_CVC, '^[0-9]{3,4}$');
    }
  }

  private _subscribeSecurityCodeChange(): void {
    this.messageBus
      .pipe(ofType(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH))
      .subscribe((response: IMessageBusEvent) => {
        const { data } = response;
        this._checkSecurityCodeLength(data);
        this.placeholder = this._getPlaceholder(data);
        this._inputElement.setAttribute(SecurityCode.PLACEHOLDER_ATTRIBUTE, this.placeholder);
        this._sendState();
      });

    this.messageBus.subscribe(
      MessageBus.EVENTS.IS_CARD_WITHOUT_CVV,
      (data: { formState: FormState; isCardPiba: boolean }) => {
        const { formState, isCardPiba } = data;
        if (formState !== FormState.AVAILABLE) {
          this._clearInputValue();
        }
        isCardPiba
          ? this._inputElement.setAttribute(SecurityCode.BLOCK_CVV_ATTRIBUTE, SecurityCode.BLOCK_CVV_VALUE)
          : this._inputElement.removeAttribute(SecurityCode.BLOCK_CVV_ATTRIBUTE);
        this._toggleSecurityCode(formState);
      }
    );
  }

  private _clearInputValue(): void {
    this._inputElement.value = SecurityCode.CLEAR_VALUE;
  }

  private _toggleSecurityCodeValidation(): void {
    this.validation.removeError(this._inputElement, this._messageElement);
    this._inputElement.setCustomValidity(SecurityCode.CLEAR_VALUE);
  }

  private _disableSecurityCode(): void {
    this._inputElement.setAttribute(SecurityCode.DISABLED_ATTRIBUTE, SecurityCode.DISABLED_PARAM);
    this._inputElement.classList.add(SecurityCode.DISABLED_CLASS);
  }

  private _enableSecurityCode(): void {
    this._inputElement.removeAttribute(SecurityCode.DISABLED_ATTRIBUTE);
    this._inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
  }

  private _setSecurityCodePattern(securityCodePattern: string): void {
    this.setAttributes({ pattern: securityCodePattern });
  }

  private _shouldDisableSecurityCode = (state: FormState): boolean =>
    state !== FormState.AVAILABLE || this._inputElement.hasAttribute(SecurityCode.BLOCK_CVV_ATTRIBUTE);

  private _toggleSecurityCode(state: FormState): void {
    if (this._shouldDisableSecurityCode(state)) {
      this._disableSecurityCode();
      this._toggleSecurityCodeValidation();
    } else {
      this._enableSecurityCode();
      this._inputElement.classList.remove(SecurityCode.DISABLED_CLASS);
    }
  }
}
