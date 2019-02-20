import each from 'jest-each';
import CardNumber from '../../../../src/core/classes/validation/CardNumber.class';

each([
  ['', true], // Couldn't identify the brand
  ['4111111111111111', true],
  ['4111111111111110', false], // A VISA card needs to pass a luhn check
  ['6759555555555555', true], // A MAESTRO brand card doesn't need to pass a luhn check
]).test('CardNumber.validateCreditCard', (cardNumber, expected) => {
  const cn = new CardNumber();
  expect(cn.validateCreditCard(cardNumber)).toEqual(expected);
});

each([
  ['', 0],
  ['4111111111111111', true],
  ['79927398713', true],
  ['6759555555555555', false],
]).test('CardNumber.luhnCheck', (cardNumber, expected) => {
  const cn = new CardNumber();
  expect(cn.luhnCheck(cardNumber)).toEqual(expected);
});
