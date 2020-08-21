import { ExpirationDate } from './ExpirationDate';
import { FormState } from '../../core/models/constants/FormState';
import { Language } from '../../core/shared/Language';
import { Selectors } from '../../core/shared/Selectors';
import { ConfigProvider } from '../../../shared/services/config/ConfigProvider';
import { mock, instance, when } from 'ts-mockito';
import { Formatter } from '../../core/shared/Formatter';
import { MessageBus } from '../../core/shared/MessageBus';
import { MessageBusMock } from '../../../testing/mocks/MessageBusMock';
import { Frame } from '../../core/shared/frame/Frame';
import { of } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';

jest.mock('../../../../src/application/core/shared/MessageBus');
jest.mock('../../../../src/application/core/shared/notification/Notification');

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
    const { expirationDateInstance } = expirationDateFixture();
    // then
    it('should return translated label', () => {
      expect(expirationDateInstance.getLabel()).toEqual(Language.translations.LABEL_EXPIRATION_DATE);
    });
  });

  // given
  describe('_setDisableListener()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const attributeName: string = 'disabled';
    // then
    it('should have attribute disabled set', () => {
      // @ts-ignore
      expirationDateInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.BLOCKED);
      });
      expirationDateInstance.setDisableListener();
      // @ts-ignore
      expect(expirationDateInstance._inputElement.hasAttribute(attributeName)).toBe(true);
    });

    // then
    it('should have no attribute disabled and class disabled', () => {
      // @ts-ignore
      expirationDateInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(FormState.AVAILABLE);
      });
      expirationDateInstance.setDisableListener();
      // @ts-ignore
      expect(expirationDateInstance._inputElement.hasAttribute(attributeName)).toBe(false);
      // @ts-ignore
      expect(expirationDateInstance._inputElement.classList.contains(ExpirationDate.DISABLE_FIELD_CLASS)).toBe(false);
    });
  });

  // given
  describe('format()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;
    const testValue: string = '232';

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, 'setValue');
      // @ts-ignore
      expirationDateInstance.format(testValue);
    });
    // then
    it('should trigger setValue method', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onBlur()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, '_sendState');
      // @ts-ignore
      expirationDateInstance.onBlur();
    });
    // then
    it('should call _sendState()', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('onFocus()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const event: Event = new Event('focus');

    // when
    beforeEach(() => {
      // @ts-ignore
      expirationDateInstance._inputElement.focus = jest.fn();
      // @ts-ignore
      expirationDateInstance.onFocus(event);
    });
    // then
    it('should call focus method from parent', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputElement.focus).toBeCalled();
    });
  });

  // given
  describe('onInput()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    const event: Event = new Event('input');
    const inputTestvalue: string = '12121';
    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore
      spy = jest.spyOn(expirationDateInstance, '_sendState');
    });
    // then
    it('should call _sendState method', () => {
      // @ts-ignore
      expirationDateInstance.onInput(event);
      // @ts-ignore
      expect(spy).toBeCalled();
    });
  });

  // given
  describe('onKeyPress()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 1 });
      event.preventDefault = jest.fn();
      // @ts-ignore
      expirationDateInstance._inputElement.focus = jest.fn();
      // @ts-ignore
      expirationDateInstance.onKeyPress(event);
    });

    // then
    it('should call focus() method', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputElement.focus).toHaveBeenCalled();
    });
  });

  // given
  describe('onKeydown()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      const event: KeyboardEvent = new KeyboardEvent('keydown', { keyCode: 34 });
      event.preventDefault = jest.fn();
      // @ts-ignore
      expirationDateInstance.onKeydown(event);
    });

    // then
    it('should set _currentKeyCode', () => {
      // @ts-ignore
      expect(expirationDateInstance._currentKeyCode).toEqual(34);
    });

    // then
    it('should set _inputSelectionStart', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputSelectionStart).toEqual(0);
    });

    // then
    it('should set _inputSelectionEnd', () => {
      // @ts-ignore
      expect(expirationDateInstance._inputSelectionEnd).toEqual(0);
    });
  });

  // given
  describe('_sendState()', () => {
    const { expirationDateInstance } = expirationDateFixture();
    let spy: jest.SpyInstance;

    // when
    beforeEach(() => {
      // @ts-ignore;
      spy = jest.spyOn(expirationDateInstance.messageBus, 'publish');
      // @ts-ignore;
      expirationDateInstance._sendState();
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
  const config: IConfig = {
    jwt: 'test',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' }
  };
  let configProvider: ConfigProvider;
  configProvider = mock<ConfigProvider>();
  let formatter: Formatter;
  let frame: Frame;
  frame = mock(Frame);
  const messageBus: MessageBus = (new MessageBusMock() as unknown) as MessageBus;
  formatter = mock(Formatter);
  // @ts-ignore
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' }
  });
  when(configProvider.getConfig$()).thenReturn(of(config));
  const expirationDateInstance: ExpirationDate = new ExpirationDate(
    instance(configProvider),
    instance(formatter),
    messageBus,
    instance(frame)
  );

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

  return { element, elementWithError, elementWithExceededValue, expirationDateInstance, configProvider };
}
