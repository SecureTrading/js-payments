import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class CardNumber extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private static DEFAULT_CARD_LENGTH = 16;
  private static LUHN_CHECK_ARRAY: any = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

  private static CARD_NUMBER_FOR_BIN_PROCESS = (cardNumber: string) => cardNumber.slice(0, 6);

  public binLookup: BinLookup;
  public cardNumberField: HTMLInputElement;
  public isCardNumberValid: boolean;

  private getLastElementOfArray = (array: []) => {
    if (array) {
      array.slice(-1).pop();
    }
  };

  constructor() {
    super(Selectors.CARD_NUMBER_INPUT, Selectors.CARD_NUMBER_MESSAGE);
    // @ts-ignore
    this.cardNumberField = document.getElementById(Selectors.CARD_NUMBER_INPUT);
    this.binLookup = new BinLookup();
    this.isCardNumberValid = true;

    this.setCardNumberAttributes();
    this.sendState();
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  protected onFocus(event: Event) {
    super.onFocus(event);
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
  }

  protected getPossibleCardLength = (cardNumber: string) =>
    this.binLookup.binLookup(cardNumber).length ? this.binLookup.binLookup(cardNumber).length : undefined;
  protected getLuhnCheckStatus = (cardNumber: string) =>
    this.binLookup.binLookup(cardNumber).luhn ? this.binLookup.binLookup(cardNumber).luhn : undefined;
  protected getCardFormat = (cardNumber: string) =>
    this.binLookup.binLookup(cardNumber).format ? this.binLookup.binLookup(cardNumber).format : undefined;

  protected getSecurityCodeLength(cardNumber: string) {
    if (this.binLookup.binLookup(cardNumber).cvcLength !== undefined) {
      return this.binLookup.binLookup(cardNumber).cvcLength[0];
    }
  }

  private setCardNumberMaxLength(cardNumber: string) {
    const possibleCardLengths = this.getPossibleCardLength(cardNumber);
    // @ts-ignore
    let maxlength: number = this.getLastElementOfArray(possibleCardLengths);
    maxlength = maxlength ? maxlength : CardNumber.DEFAULT_CARD_LENGTH;
    this.setAttributes({ maxlength });
  }

  private setCardNumberMinLength(cardNumber: string) {
    const possibleCardLengths = this.getPossibleCardLength(cardNumber);
    let minlength: number;
    minlength = possibleCardLengths[0] ? possibleCardLengths[0] : CardNumber.DEFAULT_CARD_LENGTH;
    this.setAttributes({ minlength });
  }

  private checkCardNumberLength = (cardNumber: string) =>
    this.getPossibleCardLength(cardNumber) ? this.getPossibleCardLength(cardNumber).includes(cardNumber.length) : false;

  private setCardNumberAttributes() {
    this.setAttributes({
      // @ts-ignore
      'data-luhn-check': this.isCardNumberValid,
      maxlength: CardNumber.DEFAULT_CARD_LENGTH,
      minlength: CardNumber.DEFAULT_CARD_LENGTH
    });
  }

  public publishSecurityCodeLength() {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getSecurityCodeLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
    };
    this._messageBus.publish(messageBusEvent);
  }

  private getFormFieldState(): IFormFieldState {
    const { value, validity } = this.getState();
    this.publishSecurityCodeLength();
    this.setCardNumberMaxLength(value);
    this.setCardNumberMinLength(value);
    this.formatCardNumber(value);
    return {
      value,
      validity
    };
  }

  private sendState() {
    const { value, validity } = this.getFormFieldState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getFormFieldState(),
      type: MessageBus.EVENTS.CHANGE_CARD_NUMBER
    };

    console.log(`card number length ${this.checkCardNumberLength(value)}`);
    console.log(`set card number max length: ${this.setCardNumberMaxLength(value)}`);

    if (validity) {
      const binProcessEvent: IMessageBusEvent = {
        data: CardNumber.CARD_NUMBER_FOR_BIN_PROCESS(value),
        type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS
      };
      this._messageBus.publish(binProcessEvent, true);
    }
    this._messageBus.publish(messageBusEvent);
  }

  static inArray(array: any, item: any) {
    return array.indexOf(item) >= 0;
  }

  static stripChars(string: any, regex: any) {
    if (typeof regex == 'undefined') {
      regex = /[\D+]/g;
    }
    return string.replace(regex, '');
  }

  public setAttributees(attributes: []) {
    for (let attribute in attributes) {
      let value = attributes[attribute];
      if (CardNumber.inArray(['value'], attribute)) {
        // @ts-ignore
        this.cardNumberField[attribute] = value;
      } else if (value === false) {
        this.cardNumberField.removeAttribute(attribute);
      } else {
        this.cardNumberField.setAttribute(attribute, value);
      }
    }
  }

  public formatCardNumber(cardNumber: string) {
    let field = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
    const original = cardNumber;
    let value = original;
    let selectStart = field.selectionStart;
    let selectEnd = field.selectionEnd;
    const format = this.binLookup.binLookup(value).format;

    if (format && value.length > 0) {
      // Don't bother formatting the pan if we have a blank string
      value = CardNumber.stripChars(value, undefined);
      let matches = value.match(new RegExp(format, '')).slice(1);
      if (CardNumber.inArray(matches, undefined)) {
        matches = matches.slice(0, matches.indexOf(undefined));
      }
      const matched = matches.length;
      if (this.binLookup.binLookup(value).format && matched > 1) {
        let preMatched = original.split(' ').length;
        selectStart += matched - preMatched;
        selectEnd += matched - preMatched;
        value = matches.join(' ');
      }
    }

    if (value !== original) {
      // @ts-ignore
      this.setAttributees({ value });
      this.cardNumberField.setSelectionRange(selectStart, selectEnd);
    }
  }

  /**
   * Card number validation based on Luhn algorithm, card length and card brand
   * @param cardNumber the card number to validate
   * @return whether the card number is valid
   */
  public validateCardNumber(cardNumber: string) {
    if (this.getLuhnCheckStatus(cardNumber)) {
      this.isCardNumberValid = CardNumber.luhnCheck(cardNumber);
    }
  }

  /**
   * Luhn Algorithm
   * From the right:
   *    Step 1: take the value of this digit
   *    Step 2: if the offset from the end is even
   *    Step 3: double the value, then sum the digits
   *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
   */
  public static luhnCheck(cardNumber: string) {
    let bit = 1;
    let cardNumberLength = cardNumber.length;
    let sum = 0;

    while (cardNumberLength) {
      const val = parseInt(cardNumber.charAt(--cardNumberLength), 10);
      sum += (bit ^= 1) ? CardNumber.LUHN_CHECK_ARRAY[val] : val;
    }

    return sum && sum % 10 === 0;
  }
}
