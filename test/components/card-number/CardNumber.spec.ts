import SpyInstance = jest.SpyInstance;
import { CardNumber } from '../../../src/components/card-number/CardNumber';
import { FormState } from '../../../src/core/models/constants/FormState';
import { Selectors } from '../../../src/core/shared/Selectors';
import { FormField } from '../../../src/core/shared/FormField';
import { Utils } from '../../../src/core/shared/Utils';
import { Validation } from '../../../src/core/shared/Validation';
import { MessageBus } from './../../../src/core/shared/MessageBus';
import { ConfigService } from '../../../src/core/config/ConfigService';
import { mock } from 'ts-mockito';

jest.mock('./../../../src/core/shared/MessageBus');
jest.mock('./../../../src/core/shared/Validation');

// given
describe('CardNumber', () => {
  const { inputElement, messageElement, cardNumberInstance, labelElement } = cardNumberFixture();
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
  describe('CardNumber._getCardNumberForBinProcess()', () => {
    // then
    it('should return input element', () => {
      // @ts-ignore
      expect(CardNumber._getCardNumberForBinProcess('4111111111111111')).toEqual('411111');
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
      instance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance.setFocusListener();
    });
    // then
    it('should set MessageBus listener function', () => {
      // @ts-ignore
      expect(instance.messageBus.subscribe.mock.calls[0][0]).toBe(MessageBus.EVENTS.FOCUS_CARD_NUMBER);
      // @ts-ignore
      expect(instance.messageBus.subscribe.mock.calls[0][1]).toBeInstanceOf(Function);
      // @ts-ignore
      expect(instance.messageBus.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should call format function', () => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('_setDisableListener()', () => {
    const { instance } = cardNumberFixture();

    function subscribeMock(state: FormState) {
      // @ts-ignore
      instance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(state);
      });
      // @ts-ignore
      instance._setDisableListener();
    }

    // then
    it('should set attribute disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(instance._inputElement.hasAttribute('disabled')).toEqual(true);
    });

    // then
    it('should add class st-input--disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(instance._inputElement.classList.contains('st-input--disabled')).toEqual(true);
    });

    // then
    it('should remove attribute disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(instance._inputElement.hasAttribute('disabled')).toEqual(false);
    });

    // then
    it('should remove class st-input--disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(instance._inputElement.classList.contains('st-input--disabled')).toEqual(false);
    });
  });

  // given
  describe('onBlur', () => {
    const { instance } = cardNumberFixture();

    // when
    beforeEach(() => {
      instance.validation.luhnCheck = jest.fn();
      // @ts-ignore
      instance._sendState = jest.fn();
      // @ts-ignore
      instance.onBlur();
    });

    // then
    it('should call Luhn check method with fieldInstance, inputElement and messageElement', () => {
      // @ts-ignore
      expect(instance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        instance._fieldInstance,
        // @ts-ignore
        instance._inputElement,
        // @ts-ignore
        instance._messageElement
      );
    });

    // then
    it('should call sendState method', () => {
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onFocus', () => {
    const { instance } = cardNumberFixture();

    const event: Event = new Event('focus');

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._disableSecurityCodeField = jest.fn();
      // @ts-ignore
      instance._inputElement.value = '4111';
      // @ts-ignore
      instance._inputElement.focus = jest.fn();
      // @ts-ignore
      instance.onFocus(event);
    });
    // then
    it('should call element focus', () => {
      // @ts-ignore
      expect(instance._inputElement.focus).toBeCalled();
    });

    // then
    it('should call _disableSecurityCodeField with input value', () => {
      // @ts-ignore
      expect(instance._disableSecurityCodeField).toHaveBeenCalledWith('4111');
    });
  });

  // given
  describe('onInput', () => {
    const { instance } = cardNumberFixture();
    const event: Event = new Event('input');

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._setInputValue = jest.fn();
      // @ts-ignore
      instance._sendState = jest.fn();
      // @ts-ignore
      instance.onInput(event);
    });

    // then
    it('should call _setInputValue method', () => {
      // @ts-ignore
      expect(instance._setInputValue).toHaveBeenCalled();
    });

    // then
    it('should call _sendState method', () => {
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onKeydown()', () => {
    const { instance } = cardNumberFixture();
    // @ts-ignore
    const event: KeyboardEvent = new KeyboardEvent('keydown', { keyCode: 13 });

    // then
    it('should call validation.luhnCheck and sendState if key is equal to Enter keycode', () => {
      // @ts-ignore
      instance._sendState = jest.fn();
      Validation.isEnter = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance.onKeydown(event);
      expect(instance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        instance._cardNumberInput,
        // @ts-ignore
        instance._inputElement,
        // @ts-ignore
        instance._messageElement
      );
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onPaste()', () => {
    // when
    const { instance } = cardNumberFixture();

    // when
    beforeEach(() => {
      const event = {
        clipboardData: {
          getData: jest.fn()
        },
        preventDefault: jest.fn()
      };
      Utils.stripChars = jest.fn().mockReturnValue('41111');
      // @ts-ignore
      instance._sendState = jest.fn();
      // @ts-ignore
      instance._setInputValue = jest.fn();
      // @ts-ignore
      instance.onPaste(event);
    });

    // then
    it('should call setInputValue and _sendState methods', () => {
      // @ts-ignore
      expect(instance._setInputValue).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('_getMaxLengthOfCardNumber()', () => {
    const { instance } = cardNumberFixture();
    const panLengthWithoutSpaces: number = 15;
    const numberOfWhitespaces: number = 3;
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.value = '4111111111';
    });
    // then
    it('should return max length of card number including whitespaces', () => {
      Utils.getLastElementOfArray = jest.fn().mockReturnValueOnce(panLengthWithoutSpaces);
      // @ts-ignore
      expect(instance._getMaxLengthOfCardNumber()).toEqual(panLengthWithoutSpaces + numberOfWhitespaces);
    });
  });

  // given
  describe('_setInputValue()', () => {
    const { instance } = cardNumberFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._getMaxLengthOfCardNumber = jest.fn();
      // @ts-ignore
      instance._disableSecurityCodeField = jest.fn();
      // @ts-ignore
      instance.validation.keepCursorsPosition = jest.fn();
      // @ts-ignore
      instance._formatter.number = jest
        .fn()
        .mockReturnValueOnce({ formatted: '4111 1111 1111 1111', nonformatted: '4111111111111111' });
      // @ts-ignore
      instance._setInputValue();
    });

    // then
    it('should call _getMaxLengthOfCardNumber()', () => {
      // @ts-ignore
      expect(instance._getMaxLengthOfCardNumber).toHaveBeenCalled();
    });

    // then
    it('should call _disableSecurityCodeField() with input value', () => {
      // @ts-ignore
      expect(instance._disableSecurityCodeField).toHaveBeenCalledWith(instance._inputElement.value);
    });

    // then
    it('should call validation.keepCursorsPosition() with input instance', () => {
      // @ts-ignore
      expect(instance.validation.keepCursorsPosition).toHaveBeenCalledWith(instance._inputElement);
    });

    // then
    it('should set formatted value to _inputElement.value and non-formatted value to _cardNumberValue ', () => {
      // @ts-ignore
      expect(instance._inputElement.value).toEqual('4111 1111 1111 1111');
      // @ts-ignore
      expect(instance._cardNumberValue).toEqual('4111111111111111');
    });

    // given
    describe('_sendState()', () => {
      // when
      beforeEach(() => {
        // @ts-ignore
        instance.messageBus.publish = jest.fn();
      });

      it('should call messageBus publish twice if validity is true', () => {
        // @ts-ignore
        instance._getCardNumberFieldState = jest
          .fn()
          .mockReturnValueOnce({ value: '3089500000000000021', validity: true });
        // @ts-ignore
        instance._sendState();
        // @ts-ignore
        expect(instance.messageBus.publish.mock.calls[0][0]).toEqual({
          type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS,
          data: '308950'
        });
        // @ts-ignore
        expect(instance.messageBus.publish.mock.calls[1][0]).toEqual({
          type: MessageBus.EVENTS.CHANGE_CARD_NUMBER,
          data: undefined
        });
      });

      it('should call messageBus publish once if validity is false', () => {
        // @ts-ignore
        instance._getCardNumberFieldState = jest.fn().mockReturnValueOnce({ value: '3333333', validity: false });
        // @ts-ignore
        instance._sendState();
        // @ts-ignore
        expect(instance.messageBus.publish).toHaveBeenCalledTimes(1);
      });
    });
  });

  // given
  describe('_disableSecurityCodeField()', () => {
    const { instance } = cardNumberFixture();
    const pan: string = '3089 5000 0000 0000021';
    const messageBusEvent = {
      data: FormState.BLOCKED,
      type: MessageBus.EVENTS.IS_CARD_WITHOUT_CVV
    };
    Validation.clearNonDigitsChars = jest.fn().mockReturnValueOnce('3089500000000000021');
    // @ts-ignore
    instance.messageBus.publish = jest.fn();
    // then
    it('should call publish method', () => {
      // @ts-ignore
      instance._disableSecurityCodeField(pan);
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });
});

function cardNumberFixture() {
  const html =
    '<form id="st-card-number" class="card-number" novalidate=""><label id="st-card-number-label" for="st-card-number-input" class="card-number__label card-number__label--required">Card number</label><input id="st-card-number-input" class="card-number__input" type="text" autocomplete="off" required="" data-luhn-check="true" maxlength="NaN" minlength="19"><p id="st-card-number-message" class="card-number__message"></p></form>';
  document.body.innerHTML = html;
  let configService: ConfigService;
  configService = mock(ConfigService);
  configService.getConfig = jest.fn().mockReturnValueOnce({
    placeholders: {
      pan: 'Card number',
      expirydate: 'MM/YY',
      securitycode: '***'
    }
  });
  const cardNumberInstance = new CardNumber(configService);

  function createElement(markup: string) {
    return document.createElement(markup);
  }

  const inputElement = createElement('input');
  const labelElement = document.createElement('label');
  const messageElement = createElement('p');
  const instance = new CardNumber(configService);
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
