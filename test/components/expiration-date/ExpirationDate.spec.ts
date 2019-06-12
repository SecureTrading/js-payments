import ExpirationDate from '../../../src/components/expiration-date/ExpirationDate';
import Language from '../../../src/core/shared/Language';
import MessageBus from '../../../src/core/shared/MessageBus';
import Selectors from '../../../src/core/shared/Selectors';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('ExpirationDate', () => {
  // given
  describe('ifFieldExists()', () => {
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
    const messageBusEvent = {
      type: MessageBus.EVENTS.BLOCK_EXPIRATION_DATE,
      data: true
    };
    // then
    it('should have attribute disabled set', () => {
      instance.setDisableListener();
      // @ts-ignore
      instance._messageBus.publish(messageBusEvent);
      // @ts-ignore
      // expect(instance._inputElement.hasAttribute('disabled')).toBe(true);
    });

    // then
    it('should have class disabled set', () => {
      // @ts-ignore
      instance._messageBus.publish(messageBusEvent);
      // @ts-ignore
      // expect(instance._inputElement.classList.contains('st-input--disabled')).toBe(true);
    });
  });

  // given
  describe('setFocusListener()', () => {
    const { instance } = expirationDateFixture();
    // then
    // @ts-ignore
    // instance._messageBus.publish(messageBusEvent);
    it('', () => {});
  });

  // given
  describe('format()', () => {
    const { instance } = expirationDateFixture();
    let spy: any;
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'setValue');
      // @ts-ignore
      instance.format('232');
    });
    // then
    it('should trigger setValue method', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onBlur()', () => {
    const { instance } = expirationDateFixture();
    let spy: any;
    // then
    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.blur();
      // @ts-ignore
      spy = jest.spyOn(instance, 'sendState');
    });
    it('should call sendState()', () => {
      // expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onFocus()', () => {
    const { instance } = expirationDateFixture();
    // then
    it('', () => {});
  });

  // given
  describe('onInput()', () => {
    const { instance } = expirationDateFixture();
    // then
    it('', () => {});
  });

  // given
  describe('onKeyPress()', () => {
    const { instance } = expirationDateFixture();
    let spy: any;
    // then
    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.dispatchEvent(new KeyboardEvent('keypress', { key: 1 }));
      // @ts-ignore
      spy = jest.spyOn(instance, 'isMaxLengthReached');
    });
    it('should call isMaxLengthReached', () => {
      // @ts-ignore
      instance._inputElement.dispatchEvent(new KeyboardEvent('keypress', { key: 1 }));
      // @ts-ignore
      expect(instance._inputElement.value).toEqual('1');
    });
  });

  // given
  describe('onPaste()', () => {
    const { instance } = expirationDateFixture();
    // then
    it('', () => {});
  });

  // given
  describe('isMaxLengthReached() ', () => {
    const { instance } = expirationDateFixture();
    // then
    it('should return true if input value greater than date length', () => {
      // @ts-ignore
      instance._inputElement.value = '12/12';
      // @ts-ignore;
      expect(instance.isMaxLengthReached()).toEqual(true);
    });
  });

  // given
  describe('sendState()', () => {
    const { instance } = expirationDateFixture();
    let spy: any;

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
