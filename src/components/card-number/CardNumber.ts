import { FormState } from '../../core/models/constants/FormState';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { Formatter } from '../../core/shared/Formatter';
import { FormField } from '../../core/shared/FormField';
import { Language } from '../../core/shared/Language';
import { MessageBus } from '../../core/shared/MessageBus';
import { Selectors } from '../../core/shared/Selectors';
import { Utils } from '../../core/shared/Utils';
import { Validation } from '../../core/shared/Validation';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { Service } from 'typedi';
import { ConfigService } from '../../core/config/ConfigService';

@Service()
export class CardNumber extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;

  private static DISABLED_ATTRIBUTE: string = 'disabled';
  private static DISABLED_CLASS: string = 'st-input--disabled';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static STANDARD_CARD_LENGTH: number = 19;
  private static WHITESPACES_DECREASE_NUMBER: number = 2;
  private static CARDS_IMAGES_FILES_NAMES = {
    AMEX: 'AMEX',
    VISA: 'VISA',
    MASTERCARD: 'MASTERCARD',
    PIBA: 'PIBA',
    ASTROPAYCARD: 'ASTROPAYCARD',
    DINERS: 'DINERS',
    DISCOVER: 'DISCOVER',
    JCB: 'JCB',
    MAESTRO: 'MAESTRO'
  };

  private static _getCardNumberForBinProcess = (cardNumber: string) => cardNumber.slice(0, 6);

  public validation: Validation;
  private _formatter: Formatter;
  private _cardNumberFormatted: string;
  private _cardNumberLength: number;
  private _cardNumberValue: string;
  private _isCardNumberValid: boolean;
  private _fieldInstance: HTMLInputElement = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private readonly _cardNumberField: HTMLInputElement;

  constructor(private configService: ConfigService) {
    super(Selectors.CARD_NUMBER_INPUT, Selectors.CARD_NUMBER_MESSAGE, Selectors.CARD_NUMBER_LABEL);
    this._cardNumberField = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
    this.validation = new Validation();
    this._formatter = new Formatter();
    this._isCardNumberValid = true;
    this._cardNumberLength = CardNumber.STANDARD_CARD_LENGTH;
    this.placeholder = this.configService.getConfig().placeholders.pan || '';
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
  }

  protected getLabel(): string {
    return Language.translations.LABEL_CARD_NUMBER;
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

  private _getImagePath(type: string): string {
    switch (type) {
      case CardNumber.CARDS_IMAGES_FILES_NAMES.AMEX:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.AMEX.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.ASTROPAYCARD:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.ASTROPAYCARD.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.DINERS:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.DINERS.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.DISCOVER:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.DISCOVER.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.JCB:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.JCB.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.MAESTRO:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.MAESTRO.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.MASTERCARD:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.MASTERCARD.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.PIBA:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.PIBA.toLowerCase()}.png`;
      case CardNumber.CARDS_IMAGES_FILES_NAMES.VISA:
        return `./images/${CardNumber.CARDS_IMAGES_FILES_NAMES.VISA.toLowerCase()}.png`;
      default:
        return '';
    }
  }

  private _setIconAttributes(imageURI: string, iconId: string): HTMLElement {
    let element: HTMLElement = document.createElement('img');
    element = this._setIconStyles(element);
    element.setAttribute('src', imageURI);
    element.setAttribute('id', iconId);
    return element;
  }

  private _setIconStyles(element: HTMLElement): HTMLElement {
    element.style.width = '30px';
    element.style.height = '20px';
    element.style.position = 'absolute';
    element.style.top = '27px';
    element.style.right = '8px';
    element.style.padding = '3px';
    element.style.right = '8px';
    element.style.backgroundColor = '#fff';
    element.style.border = '1px solid #6d6d6d';
    element.style.borderRadius = '4px';
    return element;
  }

  private _setImageIconPlaceholder(type: string, iconId: string): void {
    const icon: HTMLElement = document.getElementById(iconId);
    const imageURI: string = this._getImagePath(type);

    if (!icon && !imageURI) {
      return;
    }

    if (icon && !imageURI) {
      icon.remove();
      return;
    }

    if (icon && imageURI) {
      icon.remove();
    }

    this._setIconInDom(this._setIconAttributes(imageURI, iconId));
  }

  private _setIconInDom(element: HTMLElement): void {
    document.getElementById(Selectors.CARD_NUMBER_INPUT_SELECTOR).prepend(element);
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
    const { formatted, nonformatted } = this._formatter.number(this._inputElement.value, Selectors.CARD_NUMBER_INPUT);
    this._inputElement.value = formatted;
    this._cardNumberValue = nonformatted;
    this.validation.keepCursorsPosition(this._inputElement);
    const type = this._getBinLookupDetails(this._cardNumberValue)
      ? this._getBinLookupDetails(this._cardNumberValue).type
      : null;
    this._setImageIconPlaceholder(type, 'card-icon');
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
      data: formState,
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
