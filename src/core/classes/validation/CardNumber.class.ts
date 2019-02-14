import { creditCardBlocks, creditCardRegexes } from '../../imports/cards';
import { cardsLogos } from '../../imports/images';
import Validation from './Validation.class';

const {
  amex,
  astropaycard,
  chip,
  diners,
  discover,
  jcb,
  laser,
  maestro,
  mastercard,
  piba,
  visa,
} = cardsLogos;

class CardNumber extends Validation {
  constructor() {
    super();
  }

  /**
   * Luhn Algorith
   * sum of odd places = 48
   * double even places = 52
   * if it is greater than 9 -> sum both digits
   * if sum of those above is divisible by ten, YOU HAVE VALID CARD !
   */
  validateCreditCard(cardNumber: string) {
    const arry = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
    let len = cardNumber.length,
      bit = 1,
      sum = 0,
      val;

    while (len) {
      val = parseInt(cardNumber.charAt(--len), 10);
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

  getInfo(value: string) {
    for (var key in creditCardRegexes) {
      if (creditCardRegexes[key].test(value)) {
        var block;
        block = creditCardBlocks[key];
        return {
          type: key,
          blocks: block,
        };
      }
    }

    return {
      type: 'unknown',
      blocks: creditCardBlocks.general,
    };
  }
}

export default CardNumber;
