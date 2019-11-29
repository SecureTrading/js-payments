import BinLookup from '../../core/shared/BinLookup';
import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import Utils from '../../core/shared/Utils';
import Validation from '../../core/shared/Validation';

class CardNumber extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private static STANDARD_CARD_LENGTH: number = 19;
  private static WHITESPACES_DECREASE_NUMBER: number = 2;
  private static CARD_NUMBER_FOR_BIN_PROCESS = (cardNumber: string) => cardNumber.slice(0, 6);

  public binLookup: BinLookup;
  public validation: Validation;
  private _formatter: Formatter;
  private _cardNumberFormatted: string;
  private _cardNumberLength: number;
  private _cardNumberValue: string;
  private _isCardNumberValid: boolean;
  private _fieldInstance: HTMLInputElement = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private readonly _cardNumberField: HTMLInputElement;

  constructor() {
    super(Selectors.CARD_NUMBER_INPUT, Selectors.CARD_NUMBER_MESSAGE, Selectors.CARD_NUMBER_LABEL);
    this._cardNumberField = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
    this.binLookup = new BinLookup();
    this.validation = new Validation();
    this._formatter = new Formatter();
    this._isCardNumberValid = true;
    this._cardNumberLength = CardNumber.STANDARD_CARD_LENGTH;
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
    if (Validation.isKeyEnter(event)) {
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
    this._messageBus.publish(messageBusEvent);
  }

  private _getBinLookupDetails = (cardNumber: string) =>
    this.binLookup.binLookup(cardNumber).type ? this.binLookup.binLookup(cardNumber) : undefined;

  private _getCardFormat = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).format : undefined;

  private _getPossibleCardLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).length : undefined;

  private _getSecurityCodeLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).cvcLength[0] : undefined;

  private _getMaxLengthOfCardNumber() {
    const cardLengthFromBin = this._getPossibleCardLength(this._inputElement.value);
    const cardFormat = this._getCardFormat(this._inputElement.value);
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
    this._hideSecurityCodeField(this._inputElement.value);
    this._inputElement.value = this.validation.limitLength(this._inputElement.value, this._cardNumberLength);
    const { formatted, nonformatted } = this._formatter.number(this._inputElement.value, Selectors.CARD_NUMBER_INPUT);
    this._inputElement.value = formatted;
    this._cardNumberValue = nonformatted;
    this.validation.keepCursorAtSamePosition(this._inputElement);
  }

  private _setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_CARD_NUMBER, (state: boolean) => {
      if (state) {
        // @ts-ignore
        this._inputElement.setAttribute('disabled', state);
        this._inputElement.classList.add('st-input--disabled');
      } else {
        // @ts-ignore
        this._inputElement.removeAttribute('disabled');
        this._inputElement.classList.remove('st-input--disabled');
      }
    });
  }

  private _hideSecurityCodeField(cardNumber: string) {
    const number: string = Validation.clearNonDigitsChars(cardNumber);
    const isCardPiba: boolean = this.binLookup.binLookup(number).type === 'PIBA';
    const messageBusEvent: IMessageBusEvent = {
      data: isCardPiba,
      type: MessageBus.EVENTS.DISABLE_SECURITY_CODE
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _sendState() {
    const { value, validity } = this._getCardNumberFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getCardNumberFieldState(),
      type: MessageBus.EVENTS.CHANGE_CARD_NUMBER
    };
    if (validity) {
      const binProcessEvent: IMessageBusEvent = {
        data: CardNumber.CARD_NUMBER_FOR_BIN_PROCESS(value),
        type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS
      };
      this._messageBus.publish(binProcessEvent, true);
    }
    this._messageBus.publish(messageBusEvent);
  }
}

export default CardNumber;
