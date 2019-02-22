import { BrandDetailsType } from '../../imports/cardtype';
import { cardsLogos } from '../../imports/images';
import Validation from './Validation.class';
import BinLookup from './BinLookup.class';

class CardNumber extends Validation {
  static KEYS_DIGIT = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  binLookup: BinLookup;
  brand: BrandDetailsType;
  constructor() {
    super();
    this.binLookup = new BinLookup();
    this.brand = null;
  }

  /**
   * Validate a card number
   * @param cardNumber The card nuber to validate
   * @return whether the card number is valid
   */
  validateCreditCard(cardNumber: string) {
    const brand = this.binLookup.binLookup(cardNumber);
    if (brand.type === null) {
      return true;
    }
    this.brand = brand;
    let result = true;
    if (brand.luhn) {
      result = this.luhnCheck(cardNumber);
    }
    return result;
  }

  /**
   * Luhn Algorith
   * From the right:
   *   take the value of this digit
   *     if the offset from the end is even
   *       double the value, then sum the digits
   * if sum of those above is divisible by ten, YOU PASS THE LUHN !
   */
  luhnCheck(cardNumber: string) {
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

  getCardLogo() {
    let key = 'chip';
    if (this.brand && this.brand.type) {
      const brandName = this.brand.type.toLowerCase();
      if (cardsLogos[brandName]) {
        key = brandName;
      }
    }
    return cardsLogos[key];
  }

  /**
   * Method for preventing inserting non digits
   * @param event Keypress event
   */
  static isCharNumber(event: KeyboardEvent) {
    if (!CardNumber.KEYS_DIGIT.includes(event.key)) {
      event.preventDefault();
    }
  }
}

export default CardNumber;
