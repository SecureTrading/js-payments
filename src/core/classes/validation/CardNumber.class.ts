import { BrandDetailsType } from '../../imports/cardtype';
import { cardsLogos } from '../../imports/images';
import Validation from './Validation.class';
import BinLookup from './BinLookup.class';
import { appEndpoint } from '../../imports/iframe';

/**
 * Card number validation class
 */
class CardNumber extends Validation {
  private binLookup: BinLookup;
  public brand: BrandDetailsType;

  private _cardType: string;
  private _cardLength: [];
  private static DEFAULT_CARD_LENGTH = 16;

  get cardType(): string {
    return this._cardType;
  }

  get cardLength(): [] {
    return this._cardLength;
  }

  constructor(fieldId: string) {
    super();
    this.binLookup = new BinLookup();
    this.brand = null;
    this.inputValidationListener(fieldId);
  }

  /**
   * Listens to keypress action on credit card field and attach validation methods
   * @param fieldId
   */
  private inputValidationListener(fieldId: string) {
    const fieldInstance = document.getElementById(fieldId) as HTMLInputElement;
    CardNumber.setMaxLengthAttribute(
      fieldInstance,
      CardNumber.DEFAULT_CARD_LENGTH
    );
    fieldInstance.addEventListener('keypress', (event: KeyboardEvent) => {
      if (CardNumber.isCharNumber(event)) {
        fieldInstance.value = this.cardNumberFormat(fieldInstance.value);
      } else {
        event.preventDefault();
        return false;
      }
    });
  }

  /**
   *  Format input value of card number field due to card type regex
   * @param cardNumber
   */
  private cardNumberFormat(cardNumber: string) {
    const brand = this.binLookup.binLookup(cardNumber);
    if (brand.format) {
      const regex = new RegExp(brand.format);
      return cardNumber.replace(regex, '$1 $1 $1 $1');
    }
  }

  /**
   * Validate a card number
   * @param cardNumber the card number to validate
   * @return whether the card number is valid
   */
  private validateCreditCard(cardNumber: string) {
    const brand = this.binLookup.binLookup(cardNumber);
    if (brand.type === null) {
      return true;
    }
    this.brand = brand;
    let result = true;
    if (brand.luhn) {
      result = CardNumber.luhnCheck(cardNumber);
    }
    return result;
  }

  /**
   * Luhn Algorith
   * From the right:
   *    Step 1: take the value of this digit
   *    Step 2: if the offset from the end is even
   *    Step 3: double the value, then sum the digits
   *    Step 4: if sum of those above is divisible by ten, YOU PASS THE LUHN !
   */
  private static luhnCheck(cardNumber: string) {
    const arry = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
    let len = cardNumber.length,
      bit = 1,
      sum = 0;

    while (len) {
      const val = parseInt(cardNumber.charAt(--len), 10);
      sum += (bit ^= 1) ? arry[val] : val;
    }

    return sum && sum % 10 === 0;
  }

  /**
   * Returns card logo due to brand type setting, if no brand has been specified, returns standard 'chip' card
   */
  private getCardLogo() {
    let key = 'chip';
    if (this.brand && this.brand.type) {
      const brandName = this.brand.type.toLowerCase();
      if (cardsLogos[brandName]) {
        key = brandName;
      }
    }
    return cardsLogos[key];
  }

  private getSecurityCodeLength() {
    return this.brand.cvcLength;
  }

  public cardNumberSecurityCodeMatch(cardNumber: string) {
    const cardNumberProperties = {
      cardNumber,
      securityCodeLength: this.brand.cvcLength
    };
    window.postMessage(cardNumberProperties, appEndpoint);
    window.addEventListener('Card number and security code', event => {
      console.log(event);
    });
  }
}

export default CardNumber;
