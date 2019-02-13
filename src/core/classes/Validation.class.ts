import { creditCardRegexes, creditCardBlocks } from './../imports/regex';
import { cardsLogos } from '../imports/images';

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

class Validation {
  constructor() {}

  /**
   * 4847 3529 8926 3094 - valid visa credit card
   * Luhn Algorith
   * sum of odd places = 48
   * double even places = 52
   * if it is greater than 9 -> sum both digits
   * if sum of those above is divisible by ten, YOU HAVE VALID CARD !
   */

  creditCardValidation(cardNumber: string) {
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

    const dateInputMask = (element: HTMLInputElement) => {
      element.addEventListener('keyup', (event: any) => {
        let length = element.value.length;
        if (length < 5) {
          if (event.keyCode < 47 || event.keyCode > 57) {
            event.preventDefault();
          }

          if (length === 0) {
            if (event.keyCode !== 48 && event.keyCode !== 49) {
              event.preventDefault();
            }
          }

          if (length !== 1) {
            if (event.keyCode == 47) {
              event.preventDefault();
            }
          }

          if (length === 2) {
            element.value += '/';
          }
        } else {
          event.preventDefault();
        }
      });
    };

    return {
      type: 'unknown',
      blocks: creditCardBlocks.general,
    };
  }
}

export default Validation;
