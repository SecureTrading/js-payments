import each from 'jest-each';
import AnimatedCard from '../../../src/components/animated-card/AnimatedCard';
import SpyInstance = jest.SpyInstance;
import ExpirationDate from '../../../src/components/expiration-date/ExpirationDate';
import Language from '../../../src/core/shared/Language';
import Selectors from '../../../src/core/shared/Selectors';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('ExpirationDate', () => {
  // given
  describe('ExpirationDate.ifFieldExists()', () => {
    // then
    it('should return input element', () => {
      expect(ExpirationDate.ifFieldExists()).toBeTruthy();
    });

    // then
    it('should return input element', () => {
      expect(ExpirationDate.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });
  // given
  describe('ExpirationDate.addLeadingZero()', () => {
    // when
    const oneToNine: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const oneToTwelve: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // then
    each(oneToNine).it(`should return string value for each of ${oneToTwelve}`, (value: number) => {
      // @ts-ignore
      expect(typeof ExpirationDate.addLeadingZero(value)).toEqual('string');
    });

    // then
    each(oneToNine).it(
      `should return string with leading zero if indicated number equals ${oneToNine}`,
      (value: number) => {
        // @ts-ignore
        expect(ExpirationDate.addLeadingZero(value)).toEqual(`${ExpirationDate.LEADING_ZERO}${value}`);
      }
    );

    // then

    it(`should return only number indicated when number is greater or equal than ${
      // @ts-ignore
      ExpirationDate.LEADING_ZERO
    }`, () => {
      // @ts-ignore
      expect(ExpirationDate.addLeadingZero(ExpirationDate.LEADING_ZERO_LIMIT)).toEqual(
        // @ts-ignore
        `${ExpirationDate.LEADING_ZERO_LIMIT}`
      );
    });
  });

  // given
  describe('getLabel()', () => {
    const { instance } = expirationDateFixture();
    // then
    it('should return translated label', () => {
      expect(instance.getLabel()).toEqual(Language.translations.LABEL_EXPIRATION_DATE);
    });
  });

  // given
  describe('setDisableListener()', () => {
    const { instance } = expirationDateFixture();
    const attributeName: string = 'disabled';
    // then
    it('should have attribute disabled set', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(true);
      });
      instance.setDisableListener();
      // @ts-ignore
      expect(instance._inputElement.hasAttribute(attributeName)).toBe(true);
      // @ts-ignore
      expect(instance._inputElement.classList.contains(ExpirationDate.DISABLE_FIELD_CLASS)).toBe(true);
    });

    // then
    it('should have no attribute disabled and class disabled', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(false);
      });
      instance.setDisableListener();
      // @ts-ignore
      expect(instance._inputElement.hasAttribute(attributeName)).toBe(false);
      // @ts-ignore
      expect(instance._inputElement.classList.contains(ExpirationDate.DISABLE_FIELD_CLASS)).toBe(false);
    });
  });

  // given
  describe('setFocusListener()', () => {
    const { instance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback();
      });
      // @ts-ignore
      spy = jest.spyOn(instance, 'format');
      instance.setFocusListener();
    });
    // then
    it('should call format method', () => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('format()', () => {
    const { instance } = expirationDateFixture();
    let spy: jest.SpyInstance;
    const testValue: string = '232';

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'setValue');
      // @ts-ignore
      instance.format(testValue);
    });
    // then
    it('should trigger setValue method', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onBlur()', () => {
    const { instance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    //when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'sendState');
      // @ts-ignore
      instance.onBlur();
    });
    // then
    it('should call sendState()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onFocus()', () => {
    const { instance } = expirationDateFixture();
    const event: Event = new Event('focus');

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.focus = jest.fn();
      // @ts-ignore
      instance.onFocus(event);
    });
    // then
    it('should call focus method from parent', () => {
      // @ts-ignore
      expect(instance._inputElement.focus).toBeCalled();
    });
  });

  // given
  describe('onInput()', () => {
    const { instance } = expirationDateFixture();
    const event: Event = new Event('input');
    const inputTestvalue: string = '12121';
    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'sendState');
    });
    // then
    it('should call sendState method', () => {
      // @ts-ignore
      instance.onInput(event);
      // @ts-ignore
      expect(spy).toBeCalled();
    });
  });

  // given
  describe('onKeyPress()', () => {
    const { instance } = expirationDateFixture();
    // @ts-ignore
    const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 1 });
    event.preventDefault = jest.fn();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance.onKeyPress(event);
    });
  });

  // given
  describe('sendState()', () => {
    const { instance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore;
      spy = jest.spyOn(instance._messageBus, 'publish');
      // @ts-ignore;
      instance.sendState();
    });
    // then
    it('should call publish()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('_getISOFormatDate()', () => {
    const { instance } = expirationDateFixture();
    // then
    it('should return full date when second array element is truthy', () => {
      // @ts-ignore
      instance._date = [1, 33];
      // @ts-ignore
      expect(instance._getISOFormatDate()).toEqual('01/33');
    });
    // then
    it('should return first array element when it is equal zero', () => {
      // @ts-ignore
      instance._date = [0, 0];
      // @ts-ignore
      expect(instance._getISOFormatDate()).toEqual(0);
    });

    // then
    it('should return first array element with leading zero when it is not equal 1', () => {
      // @ts-ignore
      instance._date = [2, 0];
      // @ts-ignore
      expect(instance._getISOFormatDate()).toEqual('02');
    });
  });

  // given
  describe('_setSelectionRange()', () => {
    // when
    const { instance } = expirationDateFixture();
    const event = new KeyboardEvent('keypress', { key: 'Delete' });
    // @ts-ignore

    beforeEach(() => {
      // @ts-ignore
      instance._setSelectionRange(event, 0, 0);
    });

    // then
    it('should set selection range when delete key has been pressed', () => {
      // @ts-ignore
      expect(instance._inputElement.selectionStart).toEqual(0);
      // @ts-ignore
      expect(instance._inputElement.selectionEnd).toEqual(0);
    });
  });

  // given
  describe('_getValidatedDate', () => {
    const { instance } = expirationDateFixture();
    let spy: SpyInstance;
    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, '_getFixedDateString');
      // @ts-ignore
      instance._getValidatedDate('12');
    });

    // then
    it('should _getFixedDateString() function be called', () => {
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should return 01, if first two chars are equal 0', () => {
      // @ts-ignore
      expect(instance._getValidatedDate('00')).toEqual('01');
    });

    // then
    it('should return 12, if first two chars are greater than 12', () => {
      // @ts-ignore
      expect(instance._getValidatedDate('13')).toEqual('12');
    });

    // then
    each([['2', '02'], ['3', '03'], ['4', '04'], ['5', '05'], ['6', '06'], ['7', '07'], ['8', '08'], ['9', '09']]).it(
      'should return given number, with preceded zero',
      (givenValue: string, expectedValue: string) => {
        // @ts-ignore
        expect(instance._getValidatedDate(givenValue)).toEqual(expectedValue);
      }
    );
  });

  //given
  describe('onKeyPress()', () => {
    const { instance } = expirationDateFixture();
    const event = new KeyboardEvent('keypress');
    let spy: SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(ExpirationDate.prototype, 'onKeyPress');
    });
    // then
    it('should call parent function', () => {
      // @ts-ignore
      instance.onKeyPress(event);
      // @ts-ignore
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onPaste()', () => {
    const { instance } = expirationDateFixture();
    let spy: SpyInstance;
    // const event = new ClipboardEvent('paste', {
    //   // @ts-ignore
    //   dataType: 'text/plain',
    //   data: '123\r123'
    // });

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(ExpirationDate.prototype, 'onPaste');
    });
    // then
    it.skip('should call parent function', () => {
      // @ts-ignore
      instance.onPaste(event);
      expect(spy).toHaveBeenCalled();
    });
  });
});

function expirationDateFixture() {
  const html =
    '<form id="st-expiration-date" class="expiration-date" novalidate=""> <label id="st-expiration-date-label" for="st-expiration-date-input" class="expiration-date__label expiration-date__label--required">Expiration date</label> <input id="st-expiration-date-input" class="expiration-date__input error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^(0[1-9]|1[0-2])\\/([0-9]{2})$"> <div id="st-expiration-date-message" class="expiration-date__message">Field is required</div> </form>';
  document.body.innerHTML = html;
  const correctValue = '55';
  const incorrectValue = 'a';
  const correctDataValue = '12/19';
  const instance = new ExpirationDate();

  const labelElement = document.createElement('label');
  const inputElement = document.createElement('input');
  const messageElement = document.createElement('p');

  const element = document.createElement('input');
  const elementWithError = document.createElement('input');
  const elementWithExceededValue = document.createElement('input');

  labelElement.setAttribute('id', Selectors.EXPIRATION_DATE_LABEL);
  inputElement.setAttribute('id', Selectors.EXPIRATION_DATE_INPUT);
  messageElement.setAttribute('id', Selectors.EXPIRATION_DATE_MESSAGE);

  element.setAttribute('value', correctValue);
  elementWithError.setAttribute('value', incorrectValue);
  elementWithExceededValue.setAttribute('value', correctDataValue);

  document.body.appendChild(labelElement);
  document.body.appendChild(inputElement);
  document.body.appendChild(messageElement);

  return { element, elementWithError, elementWithExceededValue, instance };
}
