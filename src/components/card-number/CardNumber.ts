import { BrandDetailsType } from '../../core/imports/cardtype';
import Language from '../../core/shared/Language';
import Validation from '../../core/shared/Validation';
import BinLookup from '../../core/shared/BinLookup';
import FormField from '../../core/shared/FormField';
import Selectors from '../../core/shared/Selectors';
import MessageBus from '../../core/shared/MessageBus';

/**
 * Card number validation class
 */
export default class CardNumber extends FormField {
  private static DEFAULT_CARD_LENGTH = 16;
  private static STANDARD_CARD_FORMAT = '(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?';
  private static MESSAGE_ELEMENT_ID = 'st-card-number-message';
  public binLookup: BinLookup;
  private _cardType: string;
  private _cardLength: [];
  private messageBus: MessageBus;

  public brand: BrandDetailsType;

  get cardType(): string {
    return this._cardType;
  }

  get cardLength(): [] {
    return this._cardLength;
  }

  constructor() {
    super(Selectors.CARD_NUMBER_INPUT, Selectors.CARD_NUMBER_MESSAGE);

    this.setAttributes({
      maxlength: CardNumber.DEFAULT_CARD_LENGTH,
      minlength: CardNumber.DEFAULT_CARD_LENGTH
    });

    if (this._inputElement.value) {
      this.sendState();
    }

    // this.binLookup = new BinLookup();
    // this.brand = null;
  }

  static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.CARD_NUMBER_INPUT);
  }

  private sendState() {
    const formFieldState: FormFieldState = this.getState();
    const messageBusEvent: MessageBusEvent = {
      type: MessageBus.EVENTS.CHANGE_CARD_NUMBER,
      data: formFieldState
    };

    this._messageBus.publish(messageBusEvent);
  }

  onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  onFocus(event: Event) {
    super.onFocus(event);
    this.sendState();
  }

  onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
  }

  // private setValidity() {
  //   CardNumber.setInputErrorMessage(this._fieldInstance, CardNumber.MESSAGE_ELEMENT_ID);
  //   localStorage.setItem('cardNumberValidity', 'false');
  //
  //   if (this.validateCreditCard(this._fieldInstance.value)) {
  //     localStorage.setItem('cardNumber', this._fieldInstance.value);
  //   } else {
  //     CardNumber.customErrorMessage(Language.translations.VALIDATION_ERROR_CARD, CardNumber.MESSAGE_ELEMENT_ID);
  //   }
  // }

  // /**
  //  * TODO: Format input value of card number field due to card type regex
  //  * @param cardNumber
  //  */
  // private cardNumberFormat(cardNumber: string) {
  //   const brand = this.binLookup.binLookup(cardNumber);
  //   if (brand.format) {
  //     return cardNumber.replace(/\W/gi, '').replace(new RegExp(brand.format), '$1 ');
  //   } else {
  //     return cardNumber.replace(/\W/gi, '').replace(new RegExp(CardNumber.STANDARD_CARD_FORMAT), '$1 ');
  //   }
  // }
  //
  // /**
  //  * Card number validation based on Luhn algorithm, card length and card brand
  //  * @param cardNumber the card number to validate
  //  * @return whether the card number is valid
  //  */
  // public validateCreditCard(cardNumber: string) {
  //   const brand = this.binLookup.binLookup(cardNumber);
  //   if (brand.type === null) {
  //     return true;
  //   }
  //   this.brand = brand;
  //   let result = true;
  //   if (brand.luhn) {
  //     result = CardNumber.luhnCheck(cardNumber);
  //   }
  //   return result;
  // }
  //
  // /**
  //  * Luhn Algorithm
  //  * From the right:
  //  *    Step 1: take the value of this digit
  //  *    Step 2: if the offset from the end is even
  //  *    Step 3: double the value, then sum the digits
  //  *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
  //  */
  // public static luhnCheck(cardNumber: string) {
  //   const arry = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  //   let len = cardNumber.length,
  //     bit = 1,
  //     sum = 0;
  //
  //   while (len) {
  //     const val = parseInt(cardNumber.charAt(--len), 10);
  //     sum += (bit ^= 1) ? arry[val] : val;
  //   }
  //
  //   return sum && sum % 10 === 0;
  // }
}
