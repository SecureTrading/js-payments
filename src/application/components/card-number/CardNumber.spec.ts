import SpyInstance = jest.SpyInstance;
import { CardNumber } from './CardNumber';
import { FormState } from '../../core/models/constants/FormState';
import { Selectors } from '../../core/shared/Selectors';
import { Input } from '../../core/shared/input/Input';
import { Utils } from '../../core/shared/Utils';
import { Validation } from '../../core/shared/Validation';
import { MessageBus } from '../../core/shared/MessageBus';
import { instance, mock, when } from 'ts-mockito';
import { IconFactory } from '../../core/services/icon/IconFactory';
import { ConfigProvider } from '../../../shared/services/config/ConfigProvider';
import { Frame } from '../../core/shared/frame/Frame';
import { Formatter } from '../../core/shared/Formatter';
import { of } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { MessageBusMock } from '../../../testing/mocks/MessageBusMock';

jest.mock('../../../../src/application/core/shared/Validation');

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
  it('should create cardNumberInstance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(CardNumber);
  });

  // then
  it('should create cardNumberInstance of class CardNumber', () => {
    expect(cardNumberInstance).toBeInstanceOf(Input);
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
  describe('_setDisableListener()', () => {
    function subscribeMock(state: FormState) {
      // @ts-ignore
      cardNumberInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(state);
      });
      // @ts-ignore
      cardNumberInstance._setDisableListener();
    }

    // then
    it('should set attribute disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.hasAttribute('disabled')).toEqual(true);
    });

    // then
    it('should add class st-input--disabled', () => {
      subscribeMock(FormState.BLOCKED);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.classList.contains('st-input--disabled')).toEqual(true);
    });

    // then
    it('should remove attribute disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.hasAttribute('disabled')).toEqual(false);
    });

    // then
    it('should remove class st-input--disabled', () => {
      subscribeMock(FormState.AVAILABLE);
      // @ts-ignore
      expect(cardNumberInstance._inputElement.classList.contains('st-input--disabled')).toEqual(false);
    });
  });

  // given
  describe('onBlur', () => {
    // when
    beforeEach(() => {
      cardNumberInstance.validation.luhnCheck = jest.fn();
      // @ts-ignore
      cardNumberInstance._sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.onBlur();
    });

    // then
    it('should call Luhn check method with fieldInstance, inputElement and messageElement', () => {
      // @ts-ignore
      expect(cardNumberInstance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        cardNumberInstance._fieldInstance,
        // @ts-ignore
        cardNumberInstance._inputElement,
        // @ts-ignore
        cardNumberInstance._messageElement
      );
    });

    // then
    it('should call sendState method', () => {
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onFocus', () => {
    const event: Event = new Event('focus');

    // when
    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance._disableSecurityCodeField = jest.fn();
      // @ts-ignore
      cardNumberInstance._inputElement.value = '4111';
      // @ts-ignore
      cardNumberInstance._inputElement.focus = jest.fn();
      // @ts-ignore
      cardNumberInstance.onFocus(event);
    });
    // then
    it('should call element focus', () => {
      // @ts-ignore
      expect(cardNumberInstance._inputElement.focus).toBeCalled();
    });

    // then
    it('should call _disableSecurityCodeField with input value', () => {
      // @ts-ignore
      expect(cardNumberInstance._disableSecurityCodeField).toHaveBeenCalledWith('4111');
    });
  });

  // given
  describe('onInput', () => {
    const event: Event = new Event('input');

    // when
    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance._setInputValue = jest.fn();
      // @ts-ignore
      cardNumberInstance._sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance.onInput(event);
    });

    // then
    it('should call _setInputValue method', () => {
      // @ts-ignore
      expect(cardNumberInstance._setInputValue).toHaveBeenCalled();
    });

    // then
    it('should call _sendState method', () => {
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onKeydown()', () => {
    // @ts-ignore
    const event: KeyboardEvent = new KeyboardEvent('keydown', { keyCode: 13 });

    // then
    it('should call validation.luhnCheck and sendState if key is equal to Enter keycode', () => {
      // @ts-ignore
      cardNumberInstance._sendState = jest.fn();
      Validation.isEnter = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      cardNumberInstance.onKeydown(event);
      expect(cardNumberInstance.validation.luhnCheck).toHaveBeenCalledWith(
        // @ts-ignore
        cardNumberInstance._cardNumberInput,
        // @ts-ignore
        cardNumberInstance._inputElement,
        // @ts-ignore
        cardNumberInstance._messageElement
      );
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onPaste()', () => {
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
      cardNumberInstance._sendState = jest.fn();
      // @ts-ignore
      cardNumberInstance._setInputValue = jest.fn();
      // @ts-ignore
      cardNumberInstance.onPaste(event);
    });

    // then
    it('should call setInputValue and _sendState methods', () => {
      // @ts-ignore
      expect(cardNumberInstance._setInputValue).toHaveBeenCalled();
      // @ts-ignore
      expect(cardNumberInstance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('_getMaxLengthOfCardNumber()', () => {
    const panLengthWithoutSpaces: number = 15;
    const numberOfWhitespaces: number = 3;
    // when
    beforeEach(() => {
      // @ts-ignore
      cardNumberInstance._inputElement.value = '4111111111';
    });
    // then
    it('should return max length of card number including whitespaces', () => {
      Utils.getLastElementOfArray = jest.fn().mockReturnValueOnce(panLengthWithoutSpaces);
      // @ts-ignore
      expect(cardNumberInstance._getMaxLengthOfCardNumber()).toEqual(panLengthWithoutSpaces + numberOfWhitespaces);
    });
  });
});

function cardNumberFixture() {
  const html =
    '<form id="st-card-number" class="card-number" novalidate=""><label id="st-card-number-label" for="st-card-number-input" class="card-number__label card-number__label--required">Card number</label><input id="st-card-number-input" class="card-number__input" type="text" autocomplete="off" required="" data-luhn-check="true" maxlength="NaN" minlength="19"><p id="st-card-number-message" class="card-number__message"></p></form>';
  document.body.innerHTML = html;
  let configProvider: ConfigProvider;
  let iconFactory: IconFactory;
  let frame: Frame;
  let formatter: Formatter;
  iconFactory = mock(IconFactory);
  configProvider = mock<ConfigProvider>();
  const messageBus: MessageBus = (new MessageBusMock() as unknown) as MessageBus;
  when(configProvider.getConfig$()).thenReturn(of({} as IConfig));
  frame = mock(Frame);
  formatter = mock(Formatter);
  // @ts-ignore
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    disableNotification: false,
    placeholders: { pan: 'Card number', expirydate: 'MM/YY', securitycode: '***' }
  });
  const cardNumberInstance: CardNumber = new CardNumber(
    instance(configProvider),
    instance(iconFactory),
    instance(formatter),
    instance(frame),
    messageBus
  );

  function createElement(markup: string) {
    return document.createElement(markup);
  }

  const inputElement = createElement('input');
  const labelElement = document.createElement('label');
  const messageElement = createElement('p');
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
