import each from 'jest-each';
import SpyInstance = jest.SpyInstance;
import CardNumber from '../../../src/components/card-number/CardNumber';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';
import Utils from '../../../src/core/shared/Utils';
import MessageBus from './../../../src/core/shared/MessageBus';

jest.mock('./../../../src/core/shared/MessageBus');
jest.mock('./../../../src/core/shared/Validation');

// given
describe('CardNumber', () => {
  let {
    inputElement,
    messageElement,
    cardNumberInstance,
    testCardNumbers,
    labelElement,
    formattedCards
  } = cardNumberFixture();
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
    // @ts-ignore
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
  describe('CardNumber.getBinLookupDetails', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    // then
    it('should return undefined if card is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getBinLookupDetails(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return binLookup object if card is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getBinLookupDetails(cardNumberCorrect)).toStrictEqual(receivedObject);
    });
  });

  // given
  describe('getMaxLengthOfCardNumber()', () => {
    const { cardNumberCorrect, unrecognizedCardNumber } = cardNumberFixture();
    const maxLengthOfCardNumber = 19;
    const numberOfWhitespaces = 0;

    // then
    it('should return max length of card number', () => {
      // @ts-ignore
      expect(cardNumberInstance._getMaxLengthOfCardNumber(cardNumberCorrect)).toEqual(maxLengthOfCardNumber);
    });

    // then
    it(`should return numberOfWhitespaces equals: ${numberOfWhitespaces} when cardFormat is not defined`, () => {
      // @ts-ignore
      expect(cardNumberInstance._getMaxLengthOfCardNumber(unrecognizedCardNumber)).toEqual(
        // @ts-ignore
        CardNumber.STANDARD_CARD_LENGTH
      );
    });
  });

  // given
  describe('getCardFormat()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    // then
    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getCardFormat(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return card format regexp if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getCardFormat(cardNumberCorrect)).toEqual(receivedObject.format);
    });
  });

  // given
  describe('getPossibleCardLength()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    // then
    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getPossibleCardLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return possible card length if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getPossibleCardLength(cardNumberCorrect)).toEqual(receivedObject.length);
    });
  });

  // given
  describe('getSecurityCodeLength()', () => {
    const { unrecognizedCardNumber, cardNumberCorrect, receivedObject } = cardNumberFixture();

    // then
    it('should return undefined if card format is not recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getSecurityCodeLength(unrecognizedCardNumber)).toEqual(undefined);
    });

    // then
    it('should return possible cvc lengths if card format is recognized', () => {
      // @ts-ignore
      expect(cardNumberInstance._getSecurityCodeLength(cardNumberCorrect)).toEqual(receivedObject.cvcLength[0]);
    });
  });

  // given
  describe('setFocusListener()', () => {
    const { instance } = cardNumberFixture();
    let spy: SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'format');
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance.setFocusListener();
    });
    // then
    it('should set MessageBus listener function', () => {
      // @ts-ignore
      expect(instance._messageBus.subscribe.mock.calls[0][0]).toBe(MessageBus.EVENTS.FOCUS_CARD_NUMBER);
      // @ts-ignore
      expect(instance._messageBus.subscribe.mock.calls[0][1]).toBeInstanceOf(Function);
      // @ts-ignore
      expect(instance._messageBus.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should call format function', () => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('onBlur()', () => {
    const { instance } = cardNumberFixture();

    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.value = '4111';
      instance.validation.luhnCheck = jest.fn();
      Utils.stripChars = jest.fn().mockReturnValue('4111');
      // @ts-ignore
      instance._sendState = jest.fn();
      // @ts-ignore
      instance.onBlur();
    });
    // then
    it('validation.luhnCheck has been called', () => {
      expect(instance.validation.luhnCheck).toHaveBeenCalled();
    });
    it('_sendState has been called', () => {
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('_setDisableListener()', () => {
    const { instance } = cardNumberFixture();

    function subscribeMock(state: boolean) {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(state);
      });
      // @ts-ignore
      instance._setDisableListener();
    }

    // then
    it('should set attribute disabled', () => {
      subscribeMock(true);
      // @ts-ignore
      expect(instance._inputElement.hasAttribute('disabled')).toEqual(true);
    });

    // then
    it('should add class st-input--disabled', () => {
      subscribeMock(true);
      // @ts-ignore
      expect(instance._inputElement.classList.contains('st-input--disabled')).toEqual(true);
    });

    // then
    it('should remove attribute disabled', () => {
      subscribeMock(false);
      // @ts-ignore
      expect(instance._inputElement.hasAttribute('disabled')).toEqual(false);
    });

    // then
    it('should remove class st-input--disabled', () => {
      subscribeMock(false);
      // @ts-ignore
      expect(instance._inputElement.classList.contains('st-input--disabled')).toEqual(false);
    });
  });

  // given
  describe('onFocus()', () => {
    // when
    const { instance } = cardNumberFixture();
    const event: Event = new Event('focus');
    // @ts-ignore
    instance._inputElement.focus = jest.fn();

    // then
    it('should call super function', () => {
      // @ts-ignore
      instance.onFocus(event);
      // @ts-ignore
      expect(instance._inputElement.focus).toHaveBeenCalled();
    });
  });
});

function cardNumberFixture() {
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
  const instance = new CardNumber();
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
    ['4111110000000211', '4111 1100 0000 0211'],
    ['123456789', '123456789']
  ];
  labelElement.id = Selectors.CARD_NUMBER_LABEL;
  inputElement.id = Selectors.CARD_NUMBER_INPUT;
  messageElement.id = Selectors.CARD_NUMBER_MESSAGE;

  return {
    cardNumberInstance,
    instance,
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
