import each from 'jest-each';
import CardNumber from '../../../src/components/card-number/CardNumber';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('Class CardNumber', () => {
  let { inputElement, messageElement, cardNumberInstance, testCardNumbers } = CardNumberFixture();
  // when
  beforeAll(() => {
    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);
  });

  // then
  it('should create instance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(CardNumber);
  });

  // then
  it('should create instance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(FormField);
  });

  // given
  describe('Method luhnCheck()', () => {
    // then
    each(testCardNumbers).it('should check card number and return correct Luhn check', (cardNumber, expected) => {
      expect(CardNumberFixture().cardNumberInstance.luhnCheck(cardNumber)).toEqual(expected);
    });
  });
});

function CardNumberFixture() {
  const html =
    '<form id="st-card-number" class="card-number" novalidate=""><label for="st-card-number-input" class="card-number__label card-number__label--required">CARD NUMBER</label> <input id="st-card-number-input" class="card-number__input" type="text" autocomplete="off" required="" data-luhn-check="true" maxlength="NaN" minlength="19"> <p id="st-card-number-message" class="card-number__message"></p> </form>';
  document.body.innerHTML = html;
  let cardNumberInstance = new CardNumber();

  function createElement(markup: string) {
    return document.createElement(markup);
  }

  let inputElement = createElement('input');
  let messageElement = createElement('p');
  const testCardNumbers = [
    ['', 0],
    ['0000000000000000', 0],
    ['4111111111111111', true],
    ['79927398713', true],
    ['6759555555555555', false]
  ];
  inputElement.id = Selectors.CARD_NUMBER_INPUT;
  messageElement.id = Selectors.CARD_NUMBER_MESSAGE;

  return {
    cardNumberInstance,
    inputElement,
    messageElement,
    testCardNumbers
  };
}
