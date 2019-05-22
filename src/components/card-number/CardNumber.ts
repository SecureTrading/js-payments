import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import Utils from '../../core/shared/Utils';
import Validation from '../../core/shared/Validation';

export default class CardNumber extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private static WHITESPACES_DECREASE_NUMBER = 2;
  private static LUHN_CHECK_ARRAY: any = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  private static STANDARD_CARD_LENGTH = 19;
  private static CARD_NUMBER_FOR_BIN_PROCESS = (cardNumber: string) => cardNumber.slice(0, 6);

  public binLookup: BinLookup;
  public cardNumberField: HTMLInputElement;
  public isCardNumberValid: boolean;
  public cardNumberValue: string;
  public cardNumberFormatted: string;
  public validity: Validation;

  constructor() {
    super(Selectors.CARD_NUMBER_INPUT, Selectors.CARD_NUMBER_MESSAGE, Selectors.CARD_NUMBER_LABEL);
    this.cardNumberField = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
    this.binLookup = new BinLookup();
    this.validity = new Validation();
    this.isCardNumberValid = true;
    this.setFocusListener();
    this.backendValidation();
    this.sendState();
  }

  /**
   * Luhn Algorithm
   * From the right:
   *    Step 1: take the value of this digit
   *    Step 2: if the offset from the end is even
   *    Step 3: double the value, then sum the digits
   *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
   */
  public luhnCheck(cardNumber: string) {
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
    let errorMessage;
    if (!luhnCheck) {
      (document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement).setCustomValidity(
        'Card number format is incorrect'
      );
      errorMessage = 'Card number format is incorrect';
    } else {
      (document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement).setCustomValidity('');
      errorMessage = '';
    }
    return errorMessage;
  }

  /**
   * Sets multiple attributes on card number input.
   * @param attributes
   */
  public setCardNumberAttributes(attributes: any) {
    for (const attribute in attributes) {
      if (attributes.hasOwnProperty(attribute)) {
        const value = attributes[attribute];
        if (Utils.inArray(['value'], attribute)) {
          // @ts-ignore
          this.cardNumberField[attribute] = value;
        } else if (value === false) {
          this.cardNumberField.removeAttribute(attribute);
        } else {
          this.cardNumberField.setAttribute(attribute, value);
        }
      }
    }
  }

  /**
   * Live card formatting based on binLookup request.
   * @param cardNumber
   */
  public formatCardNumber(cardNumber: string) {
    const format = this.getCardFormat(cardNumber);
    const previousValue = cardNumber;
    let value = previousValue;
    let selectEnd = this.cardNumberField.selectionEnd;
    let selectStart = this.cardNumberField.selectionStart;

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
      this.setCardNumberAttributes({ value });
      this.cardNumberField.setSelectionRange(selectStart, selectEnd);
    }
    this.cardNumberFormatted = value;
    this.cardNumberValue = value.replace(/\s/g, '');
    return value;
  }

  /**
   * Inform about security code length based on binLookup request.
   */
  public publishSecurityCodeLength() {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getSecurityCodeLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
    };
    this._messageBus.publish(messageBusEvent);
  }

  public getBinLookupDetails = (cardNumber: string) =>
    this.binLookup.binLookup(cardNumber).type ? this.binLookup.binLookup(cardNumber) : undefined;
  public getCardFormat = (cardNumber: string) =>
    this.getBinLookupDetails(cardNumber) ? this.getBinLookupDetails(cardNumber).format : undefined;
  public getPossibleCardLength = (cardNumber: string) =>
    this.getBinLookupDetails(cardNumber) ? this.getBinLookupDetails(cardNumber).length : undefined;
  public getSecurityCodeLength = (cardNumber: string) =>
    this.getBinLookupDetails(cardNumber) ? this.getBinLookupDetails(cardNumber).cvcLength[0] : undefined;

  public getLabel(): string {
    return Language.translations.LABEL_CARD_NUMBER;
  }

  public setMinMaxLengthOfCard(cardNumber: string) {
    const minMax = {
      maxlength: this.getMaxLengthOfCardNumber(cardNumber),
      minlength: this.getMinLengthOfCardNumber(cardNumber)
    };
    this.setAttributes(minMax);
    return minMax;
  }

  public getMaxLengthOfCardNumber(cardNumber: string) {
    const cardLengthFromBin = this.getPossibleCardLength(cardNumber);
    const cardFormat = this.getCardFormat(cardNumber);
    let numberOfWhitespaces;
    if (cardFormat) {
      numberOfWhitespaces = cardFormat.split('d').length - CardNumber.WHITESPACES_DECREASE_NUMBER;
    } else {
      numberOfWhitespaces = 0;
    }

    return Utils.getLastElementOfArray(cardLengthFromBin) + numberOfWhitespaces;
  }

  public getFormFieldState(): IFormFieldState {
    const { value, validity } = this.getState();
    this.publishSecurityCodeLength();
    this.luhnCheck(value);
    this.formatCardNumber(value);
    this.setMinMaxLengthOfCard(value);
    return {
      formattedValue: this.cardNumberFormatted,
      validity,
      value: this.cardNumberValue,
      customErrorMessage: this.luhnCheck(value)
    };
  }

  protected _getAllowedParams() {
    return super._getAllowedParams().concat(['origin']);
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this.sendState();
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
  }

  private getMinLengthOfCardNumber(cardNumber: string) {
    let cardNumberMinLength = CardNumber.STANDARD_CARD_LENGTH;
    if (this.getPossibleCardLength(cardNumber)) {
      const numberOfWhitespaces =
        this.binLookup.binLookup(cardNumber).format.split('d').length - CardNumber.WHITESPACES_DECREASE_NUMBER;
      const cardNumberLength = this.getPossibleCardLength(cardNumber)[0];
      cardNumberMinLength = cardNumberLength + numberOfWhitespaces;
    }
    return cardNumberMinLength;
  }

  private sendState() {
    const { value, validity } = this.getFormFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getFormFieldState(),
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

  public backendValidation() {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD, (data: any) => {
      this.checkBackendValidity(data);
    });
  }

  public setFocusListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.FOCUS_CARD_NUMBER, () => {
      this.format(this._inputElement.value);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }
}
