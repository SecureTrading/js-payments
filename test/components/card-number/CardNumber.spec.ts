import each from 'jest-each';
import CardNumber from '../../../src/components/card-number/CardNumber';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('CardNumber', () => {
  let {
    inputElement,
    messageElement,
    cardNumberInstance,
    testCardNumbers,
    labelElement,
    formattedCards
  } = CardNumberFixture();
  // when
  beforeAll(() => {
    document.body.appendChild(inputElement);
    document.body.appendChild(labelElement);
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

  // then
  it('should have a label', () => {
    expect(cardNumberInstance.getLabel()).toBe('Card number');
  });

  // given
  describe('CardNumber.CARD_NUMBER_FOR_BIN_PROCESS', () => {
    // then
    it('should return input element', () => {
      // @ts-ignore
      expect(CardNumber.CARD_NUMBER_FOR_BIN_PROCESS('4111111111111111')).toEqual('411111');
    });
  });

  // given
  describe('CardNumber.ifFieldExists', () => {
    // then
    it('should return input element', () => {
      expect(CardNumber.ifFieldExists()).toBeTruthy();
    });

    // then
    it('should return input element', () => {
      expect(CardNumber.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });

  // given
  describe('CardNumber.luhnCheck', () => {
    // then
    each(testCardNumbers).it('should check card number and return correct Luhn check', (cardNumber, expected) => {
      expect(CardNumberFixture().cardNumberInstance.luhnCheck(cardNumber)).toEqual(expected);
    });
  });

  // given
  describe('CardNumber.setCardNumberAttributes', () => {
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
  describe('CardNumber.formatCardNumber', () => {
    // then
    each(formattedCards).it('should format card number properly', (given, accepted) => {
      expect(cardNumberInstance.formatCardNumber(given)).toEqual(accepted);
    });
  });

  // given
  describe('CardNumber.getBinLookupDetails', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = CardNumberFixture();

    // then
    it('should return undefined if card is not recognized', () => {
      expect(cardNumberInstance.getBinLookupDetails(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return binLookup object if card is recognized', () => {
      expect(cardNumberInstance.getBinLookupDetails(cardNumberCorrect)).toStrictEqual(receivedObject);
    });
  });

  // given
  describe('CardNumber.getMaxLengthOfCardNumber', () => {
    const { cardNumberCorrect } = CardNumberFixture();
    const maxLengthOfCardNumber = 21;

    // then
    it('should return max length of card number', () => {
      expect(cardNumberInstance.getMaxLengthOfCardNumber(cardNumberCorrect)).toEqual(maxLengthOfCardNumber);
    });
  });

  // given
  describe('CardNumber.setMinMaxLengthOfCard', () => {
    let expectedMinMax: any;
    const { cardNumberCorrect } = CardNumberFixture();

    // when
    beforeEach(() => {
      expectedMinMax = {
        maxlength: 21,
        minlength: 16
      };
    });
  });

  // given
  describe('CardNumber.getCardFormat', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = CardNumberFixture();

    // then
    it('should return undefined if card format is not recognized', () => {
      expect(cardNumberInstance.getCardFormat(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return card format regexp if card format is recognized', () => {
      expect(cardNumberInstance.getCardFormat(cardNumberCorrect)).toEqual(receivedObject.format);
    });
  });

  // given
  describe('CardNumber.getPossibleCardLength', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = CardNumberFixture();

    // then
    it('should return undefined if card format is not recognized', () => {
      expect(cardNumberInstance.getPossibleCardLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return possible card length if card format is recognized', () => {
      expect(cardNumberInstance.getPossibleCardLength(cardNumberCorrect)).toEqual(receivedObject.length);
    });
  });

  // given
  describe('CardNumber.getSecurityCodeLength', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = CardNumberFixture();

    // then
    it('should return undefined if card format is not recognized', () => {
      expect(cardNumberInstance.getSecurityCodeLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return possible cvc lengths if card format is recognized', () => {
      expect(cardNumberInstance.getSecurityCodeLength(cardNumberCorrect)).toEqual(receivedObject.cvcLength[0]);
    });
  });

  // given
  describe('CardNumber.getFormFieldState', () => {
    let publishSecurityCodeLengthSpy: any;
    let formatCardNumberSpy: any;
    let setMinMaxLengthOfCardSpy: any;
    // when
    beforeEach(() => {
      publishSecurityCodeLengthSpy = jest.spyOn(cardNumberInstance, 'publishSecurityCodeLength');
      formatCardNumberSpy = jest.spyOn(cardNumberInstance, 'formatCardNumber');
      cardNumberInstance.getFormFieldState();
    });
    // then
    it('should publishSecurityCodeLength has been called', () => {
      expect(publishSecurityCodeLengthSpy).toHaveBeenCalled();
    });

    // then
    it('should formatCardNumber has been called', () => {
      expect(formatCardNumberSpy).toHaveBeenCalled();
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
  const cardNumberCorrect = '3000 000000 000111';
  const unrecognizedCardNumber = '8989 8989 6899 9999';
  const receivedObject = {
    cvcLength: [3],
    format: '(\\d{1,4})(\\d{1,6})?(\\d+)?',
    length: [14, 15, 16, 17, 18, 19],
    luhn: true,
    type: 'DINERS'
  };
  const testCardNumbers = [
    ['', 0],
    ['0000000000000000', 0],
    ['4111111111111111', true],
    ['79927398713', true],
    ['6759555555555555', false]
  ];
  const cards = [
    { number: 340000000000611, expirationDate: '12/22', securityCode: 1234, brand: 'AMEX' },
    { number: 1801000000000901, expirationDate: '12/22', securityCode: 123, brand: 'ASTROPAYCARD' },
    { number: 3000000000000111, expirationDate: '12/22', securityCode: 123, brand: 'DINERS' },
    { number: 6011000000000301, expirationDate: '12/22', securityCode: 123, brand: 'DISCOVER' },
    { number: 3528000000000411, expirationDate: '12/22', securityCode: 123, brand: 'JCB' },
    { number: 5000000000000611, expirationDate: '12/22', securityCode: 123, brand: 'MAESTRO' },
    { number: 5100000000000511, expirationDate: '12/22', securityCode: 123, brand: 'MASTERCARD' },
    { number: 3089500000000000021, expirationDate: '12/22', securityCode: 123, brand: 'PIBA' },
    { number: 4111110000000211, expirationDate: '12/22', securityCode: 123, brand: 'VISA' }
  ];

  const formattedCards = [
    ['340000000000611', '3400 000000 00611'],
    ['1801000000000901', '1801 0000 0000 0901'],
    ['3000000000000111', '3000 000000 000111'],
    ['6011000000000301', '6011 0000 0000 0301'],
    ['3528000000000411', '3528 0000 0000 0411'],
    ['5000000000000611', '5000 0000 0000 0611'],
    ['5100000000000511', '5100 0000 0000 0511'],
    ['3089500000000000021', '3089 5000 0000 0000021'],
    ['4111110000000211', '4111 1100 0000 0211']
  ];
  labelElement.id = Selectors.CARD_NUMBER_LABEL;
  inputElement.id = Selectors.CARD_NUMBER_INPUT;
  messageElement.id = Selectors.CARD_NUMBER_MESSAGE;

  return {
    cardNumberInstance,
    inputElement,
    labelElement,
    messageElement,
    testCardNumbers,
    formattedCards,
    unrecognizedCardNumber,
    cardNumberCorrect,
    receivedObject
  };
}
