import each from 'jest-each';
import CardNumber from '../../../src/components/card-number/CardNumber';
import { cardsLogos } from '../../../src/core/imports/images';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';

describe('CardNumber', () => {
  let cardNumber: CardNumber;

  beforeAll(() => {
    let inputElement = document.createElement('input');
    let messageElement = document.createElement('p');

    inputElement.id = Selectors.CARD_NUMBER_INPUT;
    messageElement.id = Selectors.CARD_NUMBER_MESSAGE;

    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);

    cardNumber = new CardNumber();
  });

  it('should create instance of classes CardNumber and FormField representing form field', () => {
    expect(cardNumber).toBeInstanceOf(CardNumber);
    expect(cardNumber).toBeInstanceOf(FormField);
  });
});

each([
  ['', true], // Couldn't identify the brand
  ['4111111111111111', true],
  ['4111111111111110', false], // A VISA card needs to pass a luhn check
  ['6759555555555555', true] // A MAESTRO brand card doesn't need to pass a luhn check
]).test('CardNumber.validateCreditCard', (cardNumber, expected) => {
  // const cn = new CardNumber('card-number');
  // expect(cn.validateCreditCard(cardNumber)).toEqual(expected);
});

each([
  ['', 0],
  ['0000000000000000', 0], // Strictly any number of 0s should pass the luhn, but it shouldn't ever be a valid card so this is okay
  ['4111111111111111', true],
  ['79927398713', true],
  ['6759555555555555', false]
]).test('CardNumber.luhnCheck', (cardNumber, expected) => {
  // const cn = new CardNumber('card-number');
  // expect(CardNumber.luhnCheck(cardNumber)).toEqual(expected);
});

each([[null, cardsLogos.chip], [{ type: 'fred' }, cardsLogos.chip], [{ type: 'AMEX' }, cardsLogos.amex]]).test(
  'CardNumber.getCardLogo',
  (brand, expected) => {
    // const cn = new CardNumber('card-number');
    // cn.brand = brand;
    // expect(cn.getCardLogo()).toEqual(expected);
  }
);
