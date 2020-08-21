import { FormState } from '../../core/models/constants/FormState';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Input } from '../../core/shared/input/Input';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Utils } from '../../core/shared/utils/Utils';
import { Validation } from '../../core/shared/validation/Validation';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IconFactory } from '../../core/services/icon/IconFactory';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Styler } from '../../core/shared/styler/Styler';
import { Frame } from '../../core/shared/frame/Frame';
import { LABEL_CARD_NUMBER } from '../../core/models/constants/Translations';
import { CARD_NUMBER_INPUT, CARD_NUMBER_LABEL, CARD_NUMBER_MESSAGE } from '../../core/models/constants/Selectors';

@Service()
export class CardNumber extends Input {
  public static ifFieldExists = (): HTMLInputElement => document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;

  private static DISABLED_ATTRIBUTE: string = 'disabled';
  private static DISABLED_CLASS: string = 'st-input--disabled';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static STANDARD_CARD_LENGTH: number = 19;
  private static WHITESPACES_DECREASE_NUMBER: number = 2;

  private static _getCardNumberForBinProcess = (cardNumber: string) => cardNumber.slice(0, 6);

  public validation: Validation;
  private _panIcon: boolean;
  private _cardNumberFormatted: string;
  private _cardNumberLength: number;
  private _cardNumberValue: string;
  private _isCardNumberValid: boolean;
  private _fieldInstance: HTMLInputElement = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
  private readonly _cardNumberField: HTMLInputElement;

  constructor(
    private configProvider: ConfigProvider,
    private _iconFactory: IconFactory,
    private _formatter: Formatter,
    private frame: Frame,
    private messageBus: MessageBus
  ) {
    super(CARD_NUMBER_INPUT, CARD_NUMBER_MESSAGE, CARD_NUMBER_LABEL);
    this._cardNumberField = document.getElementById(CARD_NUMBER_INPUT) as HTMLInputElement;
    this.validation = new Validation();
    this._isCardNumberValid = true;
    this._cardNumberLength = CardNumber.STANDARD_CARD_LENGTH;
    this.placeholder = this.configProvider.getConfig().placeholders.pan || '';
    this._panIcon = this.configProvider.getConfig().panIcon;
    this.setFocusListener();
    this.setBlurListener();
    this.setSubmitListener();
    this._setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
    );
    this._sendState();
    this._inputElement.setAttribute(CardNumber.PLACEHOLDER_ATTRIBUTE, this.placeholder);
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      const styler: Styler = new Styler(this.getAllowedStyles(), this.frame.parseUrl().styles);
      if (styler.isLinedUp(config.styles.cardNumber)) {
        styler.lineUp(
          'st-card-number',
          'st-card-number-label',
          ['st-card-number', 'st-card-number--lined-up'],
          ['card-number__label', 'card-number__label--required', 'lined-up']
        );
      }
    });
  }

  protected getLabel(): string {
    return LABEL_CARD_NUMBER;
  }

  protected onBlur() {
    super.onBlur();
    this.validation.luhnCheck(this._fieldInstance, this._inputElement, this._messageElement);
    this._sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this._disableSecurityCodeField(this._inputElement.value);
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this._setInputValue();
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

  protected onKeydown(event: KeyboardEvent) {
    super.onKeydown(event);
    if (Validation.isEnter(event)) {
      this.validation.luhnCheck(this._cardNumberInput, this._inputElement, this._messageElement);
      this._sendState();
    }
  }

  protected setFocusListener() {
    super.setEventListener(MessageBus.EVENTS.FOCUS_CARD_NUMBER);
  }

  protected setBlurListener() {
    super.setEventListener(MessageBus.EVENTS.BLUR_CARD_NUMBER);
  }

  protected setSubmitListener() {
    super.setEventListener(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM);
  }

  private _publishSecurityCodeLength() {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getSecurityCodeLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _getIcon(type: string): HTMLImageElement {
    if (!type) {
      return;
    }
    return this._iconFactory.getIcon(type.toLowerCase());
  }

  private _setIconImage(type: string, iconId: string): void {
    const icon: HTMLImageElement = this._getIcon(type);
    const iconInDom: HTMLElement = document.getElementById(iconId);

    if (iconInDom) {
      iconInDom.parentNode.removeChild(iconInDom);
    }
    if (icon) {
      this._setIconInDom(icon);
    }
  }

  private _setIconInDom(element: HTMLElement): void {
    const input: HTMLElement = document.getElementById('st-card-number-wrapper');
    input.insertBefore(element, input.childNodes[0]);
  }

  private _getBinLookupDetails = (cardNumber: string) => {
    return iinLookup.lookup(cardNumber).type ? iinLookup.lookup(cardNumber) : undefined;
  };

  private _getCardFormat = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).format : undefined;

  private _getPossibleCardLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).length : undefined;

  private _getSecurityCodeLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).cvcLength[0] : undefined;

  private _getMaxLengthOfCardNumber() {
    const cardLengthFromBin = this._getPossibleCardLength(this._inputElement.value);
    this._cardNumberValue = this._inputElement.value.replace(/\s/g, '');
    const cardFormat = this._getCardFormat(this._cardNumberValue);
    let numberOfWhitespaces;
    if (cardFormat) {
      numberOfWhitespaces = cardFormat.split('d').length - CardNumber.WHITESPACES_DECREASE_NUMBER;
    } else {
      numberOfWhitespaces = 0;
    }
    this._cardNumberLength =
      Utils.getLastElementOfArray(cardLengthFromBin) + numberOfWhitespaces || CardNumber.STANDARD_CARD_LENGTH;
    return this._cardNumberLength;
  }

  private _getCardNumberFieldState(): IFormFieldState {
    const { validity } = this.getState();
    this._publishSecurityCodeLength();
    return {
      formattedValue: this._cardNumberFormatted,
      validity,
      value: this._cardNumberValue
    };
  }

  private _setInputValue() {
    this._getMaxLengthOfCardNumber();
    this._disableSecurityCodeField(this._inputElement.value);
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._cardNumberLength);
    const { formatted, nonformatted } = this._formatter.number(this._inputElement.value, CARD_NUMBER_INPUT);
    this._inputElement.value = formatted;
    this._cardNumberFormatted = formatted;
    this._cardNumberValue = nonformatted;
    this.validation.keepCursorsPosition(this._inputElement);
    const type = this._getBinLookupDetails(this._cardNumberValue)
      ? this._getBinLookupDetails(this._cardNumberValue).type
      : null;
    if (this._panIcon) {
      this._setIconImage(type, 'card-icon');
    }
  }

  private _setDisableListener() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER, (state: FormState) => {
      if (state !== FormState.AVAILABLE) {
        this._inputElement.setAttribute(CardNumber.DISABLED_ATTRIBUTE, 'true');
        this._inputElement.classList.add(CardNumber.DISABLED_CLASS);
      } else {
        // @ts-ignore
        this._inputElement.removeAttribute(CardNumber.DISABLED_ATTRIBUTE);
        this._inputElement.classList.remove(CardNumber.DISABLED_CLASS);
      }
    });
  }

  private _disableSecurityCodeField(cardNumber: string) {
    const number: string = Validation.clearNonDigitsChars(cardNumber);
    const isCardPiba: boolean = CardNumber.NO_CVV_CARDS.includes(iinLookup.lookup(number).type);
    const formState = isCardPiba ? FormState.BLOCKED : FormState.AVAILABLE;
    const messageBusEventPiba: IMessageBusEvent = {
      data: { formState, isCardPiba },
      type: MessageBus.EVENTS.IS_CARD_WITHOUT_CVV
    };
    this.messageBus.publish(messageBusEventPiba);
  }

  private _sendState() {
    const { value, validity } = this._getCardNumberFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getCardNumberFieldState(),
      type: MessageBus.EVENTS.CHANGE_CARD_NUMBER
    };
    if (validity) {
      const binProcessEvent: IMessageBusEvent = {
        data: CardNumber._getCardNumberForBinProcess(value),
        type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS
      };
      this.messageBus.publish(binProcessEvent, true);
    }
    this.messageBus.publish(messageBusEvent);
  }
}
