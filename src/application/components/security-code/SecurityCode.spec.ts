import { SecurityCode } from './SecurityCode';
import { SECURITY_CODE_INPUT, SECURITY_CODE_LABEL, SECURITY_CODE_MESSAGE } from '../../core/models/constants/Selectors';
import { Input } from '../../core/shared/input/Input';
import { Utils } from '../../core/shared/utils/Utils';
import { anyFunction, instance, mock, when } from 'ts-mockito';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { EMPTY, of } from 'rxjs';
import { MessageBusMock } from '../../../testing/mocks/MessageBusMock';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { IConfig } from '../../../shared/model/config/IConfig';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Formatter } from '../../core/shared/formatter/Formatter';
import { Frame } from '../../core/shared/frame/Frame';

jest.mock('./../../core/shared/notification/Notification');
jest.mock('./../../core/shared/message-bus/MessageBus');

// given
describe('SecurityCode', () => {
  const { securityCodeInstance } = securityCodeFixture();

  // given
  describe('init', () => {
    // then
    it('should create instance of classes SecurityCode and input representing form field', () => {
      expect(securityCodeInstance).toBeInstanceOf(SecurityCode);
      expect(securityCodeInstance).toBeInstanceOf(Input);
    });
  });

  // given
  describe('ifFieldExists', () => {
    let ifFieldExists: HTMLInputElement;
    // when
    beforeEach(() => {
      ifFieldExists = SecurityCode.ifFieldExists();
    });

    // then
    it('should security code field exist', () => {
      expect(ifFieldExists).toBeTruthy();
    });

    // then
    it('should security code field be an instance of HTMLDivElement', () => {
      expect(SecurityCode.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });

  // given
  describe('getLabel', () => {
    // then
    it('should have a label', () => {
      expect(securityCodeInstance.getLabel()).toBe('Security code');
    });
  });

  // given
  describe('setDisableListener', () => {
    const { securityCodeInstance } = securityCodeFixture();
    // then
    it('should set attribute disabled and add class to classList', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(true);
      });
      // @ts-ignore
      securityCodeInstance._setDisableListener();
    });

    // then
    it('should remove attribute disabled and remove class from classList', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(false);
      });
      // @ts-ignore
      securityCodeInstance._setDisableListener();
      // @ts-ignore
      expect(securityCodeInstance._inputElement.hasAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME)).toEqual(false);
      // @ts-ignore
      expect(securityCodeInstance._inputElement.classList.contains(SecurityCode.DISABLED_ATTRIBUTE_CLASS)).toEqual(
        false
      );
    });
  });

  // given
  describe('onBlur', () => {
    const { securityCodeInstance } = securityCodeFixture();
    // @ts-ignore
    const spySendState = jest.spyOn(securityCodeInstance, '_sendState');

    beforeEach(() => {
      // @ts-ignore
      securityCodeInstance.onBlur();
    });

    // then
    it('should sendState method has been called', () => {
      expect(spySendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onFocus()', () => {
    // when
    const { securityCodeInstance } = securityCodeFixture();
    const event: Event = new Event('focus');
    // @ts-ignore
    securityCodeInstance._inputElement.focus = jest.fn();

    // then
    it('should call super function', () => {
      // @ts-ignore
      securityCodeInstance.onFocus(event);
      // @ts-ignore
      expect(securityCodeInstance._inputElement.focus).toHaveBeenCalled();
    });
  });

  // given
  describe('onInput', () => {
    const { securityCodeInstance } = securityCodeFixture();
    // @ts-ignore
    securityCodeInstance._sendState = jest.fn();
    const event = new Event('input');

    beforeEach(() => {
      // @ts-ignore
      securityCodeInstance._inputElement.value = '1234';
      // @ts-ignore
      securityCodeInstance.onInput(event);
    });

    // then
    it('should call sendState', () => {
      // @ts-ignore
      expect(securityCodeInstance._sendState).toHaveBeenCalled();
    });

    // then
    it('should trim too long value', () => {
      // @ts-ignore
      expect(securityCodeInstance._inputElement.value).toEqual('');
    });
  });

  // given
  describe('onPaste()', () => {
    // when
    const { securityCodeInstance } = securityCodeFixture();

    // when
    beforeEach(() => {
      const event = {
        clipboardData: {
          getData: jest.fn()
        },
        preventDefault: jest.fn()
      };
      Utils.stripChars = jest.fn().mockReturnValue('111');
      // @ts-ignore
      securityCodeInstance._sendState = jest.fn();
      // @ts-ignore
      securityCodeInstance.onPaste(event);
    });

    // then
    it('should call _sendState method', () => {
      // @ts-ignore
      expect(securityCodeInstance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onKeyPress()', () => {
    const { securityCodeInstance } = securityCodeFixture();
    const event = new KeyboardEvent('keypress');

    // when
    beforeEach(() => {
      // @ts-ignore
      SecurityCode.prototype.onKeyPress = jest.fn();
      // @ts-ignore
      securityCodeInstance.onKeyPress(event);
    });

    // then
    it('should call onKeyPress', () => {
      // @ts-ignore
      expect(SecurityCode.prototype.onKeyPress).toHaveBeenCalledWith(event);
    });
  });

  // given
  describe('_sendState', () => {
    const { securityCodeInstance, messageBus } = securityCodeFixture();
    // @ts-ignore
    it('should publish method has been called', () => {
      spyOn(messageBus, 'publish');

      // @ts-ignore
      securityCodeInstance._sendState();
      // @ts-ignore
      expect(securityCodeInstance.messageBus.publish).toHaveBeenCalled();
    });
  });

  // given
  describe('_subscribeSecurityCodeChange', () => {
    const { securityCodeInstance, messageBus, configProvider } = securityCodeFixture();
    when(configProvider.getConfig()).thenReturn({ placeholders: { securitycode: '***' } } as IConfig);
    it('should return standard security code pattern', () => {
      // then
      messageBus.publish({ type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, data: 3 });
      // @ts-ignore
      expect(securityCodeInstance.placeholder).toEqual('***');
    });
  });

  // given
  describe('_setSecurityCodePattern', () => {
    const pattern = 'some243pa%^tern';
    const { securityCodeInstance } = securityCodeFixture();
    // then
    it('should set pattern attribute on input field', () => {
      // @ts-ignore
      securityCodeInstance._setSecurityCodePattern(pattern);
      // @ts-ignore
      expect(securityCodeInstance._inputElement.getAttribute('pattern')).toEqual(pattern);
    });
  });
});

function securityCodeFixture() {
  const html =
    '<form id="st-security-code" class="security-code" novalidate=""><label id="st-security-code-label" for="st-security-code-input" class="security-code__label security-code__label--required">Security code</label><input id="st-security-code-input" class="security-code__input error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^[0-9]{3}$"><div id="st-security-code-message" class="security-code__message">Field is required</div></form>';
  document.body.innerHTML = html;
  const labelElement = document.createElement('label');
  const inputElement = document.createElement('input');
  const messageElement = document.createElement('p');

  labelElement.id = SECURITY_CODE_LABEL;
  inputElement.id = SECURITY_CODE_INPUT;
  messageElement.id = SECURITY_CODE_MESSAGE;

  document.body.appendChild(labelElement);
  document.body.appendChild(inputElement);
  document.body.appendChild(messageElement);

  const config: IConfig = {
    jwt: 'test',
    disableNotification: false,
    placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' }
  };

  const communicatorMock: InterFrameCommunicator = mock(InterFrameCommunicator);
  when(communicatorMock.incomingEvent$).thenReturn(EMPTY);

  const configProvider: ConfigProvider = mock<ConfigProvider>();
  let formatter: Formatter;
  formatter = mock(Formatter);
  let frame: Frame;
  frame = mock(Frame);
  const localStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  when(localStorage.select(anyFunction())).thenReturn(of('34****4565'));
  when(configProvider.getConfig$()).thenReturn(of(config));
  when(configProvider.getConfig()).thenReturn(config);
  const messageBus: MessageBus = (new MessageBusMock() as unknown) as MessageBus;
  const securityCodeInstance = new SecurityCode(
    instance(configProvider),
    instance(localStorage),
    instance(formatter),
    messageBus,
    instance(frame)
  );
  // @ts-ignore

  return { securityCodeInstance, configProvider, communicatorMock, messageBus };
}
