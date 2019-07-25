import BinLookup from '../../core/shared/BinLookup';
import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import Utils from '../../core/shared/Utils';
import Validation from '../../core/shared/Validation';

export default class CardNumber extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private static CARD_NUMBER_FOR_BIN_PROCESS = (cardNumber: string) => cardNumber.slice(0, 6);
  private static LUHN_CHECK_ARRAY: number[] = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  private static STANDARD_CARD_LENGTH: number = 19;
  private static WHITESPACES_DECREASE_NUMBER: number = 2;

  public binLookup: BinLookup;
  public validity: Validation;
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
    this.validity = new Validation();
    this._isCardNumberValid = true;
    this._cardNumberLength = CardNumber.STANDARD_CARD_LENGTH;
    this.setFocusListener();
    this.setBlurListener();
    this._setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
    );
    this._sendState();
  }

  /**
   * getAllowedParams()
   */
  protected getAllowedParams() {
    return super.getAllowedParams().concat(['origin']);
  }

  /**
   * getLabel()
   */
  protected getLabel(): string {
    return Language.translations.LABEL_CARD_NUMBER;
  }

  /**
   * onBlur()
   */
  protected onBlur() {
    super.onBlur();
    this._luhnCheck(this._inputElement.value);
    this._sendState();
  }

  /**
   * onFocus()
   * @param event
   */
  protected onFocus(event: Event) {
    super.onFocus(event);
  }

  /**
   * onInput()
   * @param event
   */
  protected onInput(event: Event) {
    super.onInput(event);
    this._inputElement.value = Formatter.trimNonNumericExceptSpace(this._inputElement.value);
    this._getMaxLengthOfCardNumber(this._inputElement.value);
    this._inputElement.value = this._inputElement.value.substring(0, this._cardNumberLength);
    this._sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this._getMaxLengthOfCardNumber(this._inputElement.value);
    this._inputElement.value = this._inputElement.value.substring(0, this._cardNumberLength);
    this._sendState();
  }

  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
  }

  /**
   * Sets focus listener, controls focusing on input field.
   */
  protected setFocusListener() {
    super.setEventListener(MessageBus.EVENTS.FOCUS_CARD_NUMBER);
  }

  /**
   * Sets blur listener, controls blurring on input field.*
   */
  protected setBlurListener() {
    super.setEventListener(MessageBus.EVENTS.BLUR_CARD_NUMBER);
  }


  /**
   * Luhn Algorithm
   * From the right:
   *    Step 1: take the value of this digit
   *    Step 2: if the offset from the end is even
   *    Step 3: double the value, then sum the digits
   *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
   * @param cardNumber
   * @private
   */
  private _luhnCheck(cardNumber: string) {
    const cardNumberWithoutSpaces = cardNumber.replace(/\s/g, '');
    let bit = 1;
    let cardNumberLength = cardNumberWithoutSpaces.length;
    let sum = 0;

    while (cardNumberLength) {
      const val = parseInt(cardNumberWithoutSpaces.charAt(--cardNumberLength), 10);
      bit = bit ^ 1;
      const algorithmValue = bit ? CardNumber.LUHN_CHECK_ARRAY[val] : val;
      sum += algorithmValue;
    }

    const luhnCheck = sum && sum % 10 === 0;
    this.validity.luhnCheckValidation(luhnCheck, this._fieldInstance, this._inputElement, this._messageElement);
    return luhnCheck;
  }

  /**
   * Sets multiple attributes on card number input.
   * @param attributes
   * @private
   */
  private _setCardNumberAttributes(attributes: any) {
    for (const attribute in attributes) {
      if (attributes.hasOwnProperty(attribute)) {
        const value = attributes[attribute];
        if (Utils.inArray(['value'], attribute)) {
          // @ts-ignore
          this._cardNumberField[attribute] = value;
        } else if (value === false) {
          this._cardNumberField.removeAttribute(attribute);
        } else {
          this._cardNumberField.setAttribute(attribute, value);
        }
      }
    }
  }

  /**
   * Live card formatting based on binLookup request.
   * @param cardNumber
   * @private
   */
  private _formatCardNumber(cardNumber: string) {
    const format = this._getCardFormat(cardNumber);
    const previousValue = cardNumber;
    let value = previousValue;
    let selectEnd = this._cardNumberField.selectionEnd;
    let selectStart = this._cardNumberField.selectionStart;

    if (format && value.length > 0) {
      value = Utils.stripChars(value, undefined);
      let matches = value.match(new RegExp(format, '')).slice(1);
      if (Utils.inArray(matches, undefined)) {
        matches = matches.slice(0, matches.indexOf(undefined));
      }
      const matched = matches.length;
      if (this.binLookup.binLookup(value).format && matched > 1) {
        const preMatched = previousValue.split(' ').length;
        selectStart += matched - preMatched;
        selectEnd += matched - preMatched;
        value = matches.join(' ');
      }
    }

    if (value !== previousValue) {
      this._setCardNumberAttributes({ value });
      this._cardNumberField.setSelectionRange(selectStart, selectEnd);
    }
    this._cardNumberFormatted = value;
    this._cardNumberValue = value.replace(/\s/g, '');
    return value;
  }

  /**
   * Inform about security code length based on binLookup request.
   * @private
   */
  private _publishSecurityCodeLength() {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getSecurityCodeLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   *
   * @param cardNumber
   * @private
   */
  private _getBinLookupDetails = (cardNumber: string) =>
    this.binLookup.binLookup(cardNumber).type ? this.binLookup.binLookup(cardNumber) : undefined;

  /**
   *
   * @param cardNumber
   * @private
   */
  private _getCardFormat = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).format : undefined;

  /**
   *
   * @param cardNumber
   * @private
   */
  private _getPossibleCardLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).length : undefined;

  /**
   *
   * @param cardNumber
   * @private
   */
  private _getSecurityCodeLength = (cardNumber: string) =>
    this._getBinLookupDetails(cardNumber) ? this._getBinLookupDetails(cardNumber).cvcLength[0] : undefined;

  /**
   *
   * @param cardNumber
   * @private
   */
  private _getMaxLengthOfCardNumber(cardNumber: string) {
    const cardLengthFromBin = this._getPossibleCardLength(cardNumber);
    const cardFormat = this._getCardFormat(cardNumber);
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

  /**
   *
   * @private
   */
  private _getFormFieldState(): IFormFieldState {
    const { value, validity } = this.getState();
    this._publishSecurityCodeLength();
    this._formatCardNumber(value);
    return {
      formattedValue: this._cardNumberFormatted,
      validity,
      value: this._cardNumberValue
    };
  }

  /**
   *
   * @private
   */
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

  /**
   *
   * @private
   */
  private _sendState() {
    const { value, validity } = this._getFormFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this._getFormFieldState(),
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
