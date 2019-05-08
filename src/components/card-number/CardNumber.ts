import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

export default class CardNumber extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
  private static CARD_NUMBER_FOR_BIN_PROCESS = (cardNumber: string) => cardNumber.slice(0, 6);
  private static DEFAULT_CARD_LENGTH = 16;
  private static LUHN_CHECK_ARRAY: any = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

  public binLookup: BinLookup;
  public isCardNumberValid: boolean;

  constructor() {
    super(Selectors.CARD_NUMBER_INPUT, Selectors.CARD_NUMBER_MESSAGE);
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
    let maxlength = this.getPossibleCardLength(cardNumber)
      ? this.getPossibleCardLength(cardNumber)
          .slice(-1)
          .pop()
      : CardNumber.DEFAULT_CARD_LENGTH;

    this.setAttributes({ maxlength });
  }

  private checkCardNumberLength = (cardNumber: string) =>
    this.getPossibleCardLength(cardNumber) ? this.getPossibleCardLength(cardNumber).includes(cardNumber.length) : false;

  private setCardNumberAttributes() {
    this.setAttributes({
      'data-luhn-check': this.isCardNumberValid,
      maxlength: CardNumber.DEFAULT_CARD_LENGTH,
      minlength: CardNumber.DEFAULT_CARD_LENGTH
    });
  }

  public publishSecurityCodeLength() {
    const { value } = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: this.getPossibleCardLength(value),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
    };
    this._messageBus.publish(messageBusEvent);
  }

  private getFormFieldState(): IFormFieldState {
    const { value, validity } = this.getState();
    this.publishSecurityCodeLength();
    this.formatCardNumber();
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
    console.log(this.checkCardNumberLength(value));
    console.log(this.setCardNumberMaxLength(value));

    if (validity) {
      const binProcessEvent: IMessageBusEvent = {
        data: CardNumber.CARD_NUMBER_FOR_BIN_PROCESS(value),
        type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS
      };
      this._messageBus.publish(binProcessEvent, true);
    }
    this._messageBus.publish(messageBusEvent);
  }

  public formatCardNumber() {}

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
