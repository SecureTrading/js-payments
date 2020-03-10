import { SecurityCode } from '../../../src/components/security-code/SecurityCode';
import { Selectors } from '../../../src/core/shared/Selectors';
import { FormField } from '../../../src/core/shared/FormField';
import { Utils } from '../../../src/core/shared/Utils';
import { ConfigService } from '../../../src/core/config/ConfigService';
import { instance, mock, when } from 'ts-mockito';
import { ConfigProvider } from '../../../src/core/config/ConfigProvider';

jest.mock('../../../src/core/shared/MessageBus');
jest.mock('./../../../src/core/shared/Notification');

// given
describe('SecurityCode', () => {
  let securityCode: SecurityCode;

  beforeAll(() => {
    const labelElement = document.createElement('label');
    const inputElement = document.createElement('input');
    const messageElement = document.createElement('p');

    labelElement.id = Selectors.SECURITY_CODE_LABEL;
    inputElement.id = Selectors.SECURITY_CODE_INPUT;
    messageElement.id = Selectors.SECURITY_CODE_MESSAGE;

    document.body.appendChild(labelElement);
    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);

    let configProvider: ConfigProvider;
    configProvider = mock(ConfigProvider);
    when(configProvider.getConfig()).thenReturn({
      jwt: '',
      notifications: true,
      placeholders: { pan: '4154654', expirydate: '12/22', securitycode: '123' }
    });
    securityCode = new SecurityCode(instance(configProvider));
  });

  // given
  describe('init', () => {
    // then
    it('should create instance of classes SecurityCode and FormField representing form field', () => {
      expect(securityCode).toBeInstanceOf(SecurityCode);
      expect(securityCode).toBeInstanceOf(FormField);
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
      expect(securityCode.getLabel()).toBe('Security code');
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
      expect(securityCodeInstance._inputElement.classList.contains(SecurityCode.DISABLED_ATTRIBUTE_CLASS)).toEqual(false);
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
    it('should publish method has been called', () => {
      // @ts-ignore
      expect(securityCodeInstance.messageBus.publish).toHaveBeenCalled();
    });

    // then
    it('should sendState method has been called', () => {
      // @ts-ignore
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
      expect(securityCodeInstance._inputElement.value).toEqual('123');
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
    const { securityCodeInstance } = securityCodeFixture();
    it('should publish method has been called', () => {
      // @ts-ignore
      securityCodeInstance._sendState();
      // @ts-ignore
      expect(securityCodeInstance.messageBus.publish).toHaveBeenCalled();
    });
  });

  // given
  describe('_subscribeSecurityCodeChange', () => {
    const { securityCodeInstance } = securityCodeFixture();
    let spySecurityCodePattern: jest.SpyInstance;

    // then
    it('should return standard security code pattern', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        // @ts-ignore
        callback(SecurityCode.STANDARD_INPUT_LENGTH);
      });
      // @ts-ignore
      securityCodeInstance._subscribeSecurityCodeChange();
      // @ts-ignore
      spySecurityCodePattern = jest.spyOn(securityCodeInstance, '_setSecurityCodePattern');
    });

    // then
    it('should set extended security code pattern', () => {
      // @ts-ignore
      securityCodeInstance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        // @ts-ignore
        callback(SecurityCode.SPECIAL_INPUT_LENGTH);
      });
      // @ts-ignore
      securityCodeInstance._subscribeSecurityCodeChange();
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
  let configProvider: ConfigProvider;
  configProvider = mock(ConfigProvider);
  configProvider.getConfig = jest.fn().mockReturnValueOnce({
    placeholders: {
      pan: 'pan placeholder',
      securitycode: 'securitycode placeholder',
      expirydate: 'expirydate placeholder'
    }
  });
  const securityCodeInstance = new SecurityCode(configProvider);
  return { securityCodeInstance };
}
