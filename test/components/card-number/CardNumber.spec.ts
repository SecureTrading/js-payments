import each from 'jest-each';
import CardNumber from '../../../src/components/card-number/CardNumber';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('Class CardNumber', () => {
  let { inputElement, messageElement, cardNumberInstance, testCardNumbers, labelElement } = CardNumberFixture();
  // when
  beforeAll(() => {
    document.body.appendChild(inputElement);
    document.body.appendChild(labelElement);
    document.body.appendChild(messageElement);
    FormField.prototype.getLabel = jest.fn(); // Not implemented in FormField
  });

  // then
  it('should create instance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(CardNumber);
  });

  // then
  it('should create instance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(FormField);
  });

  // then
  it('should have a label', () => {
    expect(cardNumberInstance.getLabel()).toBe('Card number');
  });

  // given
  describe('Method luhnCheck', () => {
    // then
    each(testCardNumbers).it('should check card number and return correct Luhn check', (cardNumber, expected) => {
      expect(CardNumberFixture().cardNumberInstance.luhnCheck(cardNumber)).toEqual(expected);
    });
  });

  // given
  describe('Method setCardNumberAttributes', () => {
    // then
    it('should set proper card number attributes given in params', () => {
      cardNumberInstance.setCardNumberAttributes({
        firstAttribute: 'FUUUUUUUUUUUUUU',
        secondAttribute: 'Like a sir',
        thirdAttribute: 'Pepe the Frog'
      });
      expect(cardNumberInstance.cardNumberField.getAttribute('firstAttribute')).toEqual('FUUUUUUUUUUUUUU');
      expect(cardNumberInstance.cardNumberField.getAttribute('secondAttribute')).toEqual('Like a sir');
      expect(cardNumberInstance.cardNumberField.getAttribute('thirdAttribute')).toEqual('Pepe the Frog');
    });
  });

  // given
  describe('Method formatCardNumber', () => {
    // then
    it('should format card number properly', () => {
      expect(cardNumberInstance.formatCardNumber('4111111111111111')).toEqual('4111 1111 1111 1111');
    });
  });
});

function CardNumberFixture() {
  const html =
    '<form id="st-card-number" class="card-number" novalidate=""><label id="st-card-number-label" for="st-card-number-input" class="card-number__label card-number__label--required">Card number</label><input id="st-card-number-input" class="card-number__input" type="text" autocomplete="off" required="" data-luhn-check="true" maxlength="NaN" minlength="19"><p id="st-card-number-message" class="card-number__message"></p></form>';
  document.body.innerHTML = html;
  let cardNumberInstance = new CardNumber();

  function createElement(markup: string) {
    return document.createElement(markup);
  }

  let inputElement = createElement('input');
  let labelElement = document.createElement('label');
  let messageElement = createElement('p');
  const testCardNumbers = [
    ['', 0],
    ['0000000000000000', 0],
    ['4111111111111111', true],
    ['79927398713', true],
    ['6759555555555555', false]
  ];
  labelElement.id = Selectors.CARD_NUMBER_LABEL;
  inputElement.id = Selectors.CARD_NUMBER_INPUT;
  messageElement.id = Selectors.CARD_NUMBER_MESSAGE;

  return {
    cardNumberInstance,
    inputElement,
    labelElement,
    messageElement,
    testCardNumbers
  };
}
