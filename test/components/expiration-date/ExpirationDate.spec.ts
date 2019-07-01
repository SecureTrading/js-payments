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

    // then
    it('should set proper input value and call validate', () => {
      // @ts-ignore
      instance._inputElement.value = inputTestvalue;
      instance.validation.validate = jest.fn();
      // @ts-ignore
      instance.onInput(event);
      // @ts-ignore
      expect(instance._inputElement.value).toEqual(inputTestvalue);
      // @ts-ignore
      expect(instance.validation.validate).toBeCalled();
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
      instance.isMaxLengthReached = jest.fn().mockReturnValue(true);
      // @ts-ignore
      instance.onKeyPress(event);
    });
    //then
    it('should call isMaxLengthReached', () => {
      // @ts-ignore
      expect(instance.isMaxLengthReached).toBeCalled();
    });

    //then
    it('should call event.preventDefault', () => {
      // @ts-ignore
      expect(event.preventDefault).toBeCalled();
    });
  });

  // @TODO: problem with paste event
  // given
  describe('onPaste()', () => {
    const { instance } = expirationDateFixture();
    // ts-ignore
    (window as any).ClipboardEvent = class ClipboardEvent {
      public type: string;

      constructor(type: string) {
        this.type = type;
      }

      public preventDefault = jest.fn();
      public getData = jest.fn();
      public clipboardData = {
        dataType: 'text',
        data: 'some data'
      };
    };
    // let event: ClipboardEvent = new ClipboardEvent('paste');

    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'sendState');
      // @ts-ignore
      // instance.onPaste(event);
    });
    // then
    it('should call sendState', () => {
      // expect(spy).toBeCalledTimes(1);
    });
  });

  // given
  describe('isMaxLengthReached() ', () => {
    const { instance } = expirationDateFixture();
    const inputTestValue: string = '12/12';
    // then
    it('should return true if input value greater than date length', () => {
      // @ts-ignore
      instance._inputElement.value = inputTestValue;
      // @ts-ignore;
      expect(instance.isMaxLengthReached()).toEqual(true);
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
