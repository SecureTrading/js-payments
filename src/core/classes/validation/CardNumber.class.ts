import { BrandDetailsType } from '../../imports/cardtype';
import { cardsLogos } from '../../imports/images';
import Validation from './Validation.class';
import BinLookup from './BinLookup.class';

class CardNumber extends Validation {
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

  getCardLogo(brand: string) {
    if (brand === 'amex') {
      return amex;
    } else if (brand === 'astropaycard') {
      return astropaycard;
    } else if (brand === 'diners') {
      return diners;
    } else if (brand === 'discover') {
      return discover;
    } else if (brand === 'jcb') {
      return jcb;
    } else if (brand === 'laser') {
      return laser;
    } else if (brand === 'maestro') {
      return maestro;
    } else if (brand === 'mastercard') {
      return mastercard;
    } else if (brand === 'piba') {
      return piba;
    } else if (brand === 'visa') {
      return visa;
    } else {
      return chip;
    }
  }
}

export default CardNumber;
