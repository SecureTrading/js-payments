import SecurityCode from '../../../src/components/security-code/SecurityCode';
import Formatter from '../../../src/core/shared/Formatter';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';

jest.mock('../../../src/core/shared/MessageBus');

// given
describe('SecurityCode', () => {
  let securityCode: SecurityCode;

  beforeAll(() => {
    let labelElement = document.createElement('label');
    let inputElement = document.createElement('input');
    let messageElement = document.createElement('p');

    labelElement.id = Selectors.SECURITY_CODE_LABEL;
    inputElement.id = Selectors.SECURITY_CODE_INPUT;
    messageElement.id = Selectors.SECURITY_CODE_MESSAGE;

    document.body.appendChild(labelElement);
    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);

    securityCode = new SecurityCode();
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
  describe('setFocusListener', () => {
    const { instance } = securityCodeFixture();
    let spy: jest.SpyInstance;

    // when
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
    it('should call format method', () => {
      expect(spy).toBeCalledTimes(1);
    });
  });

  // given
  describe('setDisableListener', () => {
    const { instance } = securityCodeFixture();
    // then
    it('should set attribute disabled and add class to classList', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(true);
      });

      instance.setDisableListener();
      // @ts-ignore
      expect(instance._inputElement.hasAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME)).toEqual(true);
      // @ts-ignore
      expect(instance._inputElement.classList.contains(SecurityCode.DISABLED_ATTRIBUTE_CLASS)).toEqual(true);
    });

    // then
    it('should remove attribute disabled and remove class from classList', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(false);
      });
      instance.setDisableListener();
      // @ts-ignore
      expect(instance._inputElement.hasAttribute(SecurityCode.DISABLED_ATTRIBUTE_NAME)).toEqual(false);
      // @ts-ignore
      expect(instance._inputElement.classList.contains(SecurityCode.DISABLED_ATTRIBUTE_CLASS)).toEqual(false);
    });
  });

  // given
  describe('onBlur', () => {
    const { instance } = securityCodeFixture();
    // @ts-ignore
    const spySendState = jest.spyOn(instance, '_sendState');

    beforeEach(() => {
      // @ts-ignore
      instance.onBlur();
    });

    // then
    it('should publish method has been called', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalled();
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
    const { instance } = securityCodeFixture();
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

  // given
  describe('onInput', () => {
    const { instance } = securityCodeFixture();
    // @ts-ignore
    instance._sendState = jest.fn();
    const event = new Event('input');

    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.value = '1234';
      // @ts-ignore
      instance.onInput(event);
    });

    // then
    it('should call sendState', () => {
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });

    // then
    it('should trim too long value', () => {
      // @ts-ignore
      expect(instance._inputElement.value).toEqual('123');
    });
  });

  // given
  describe('onPaste()', () => {
    // when
    const { instance } = securityCodeFixture();

    // when
    beforeEach(() => {
      Formatter.trimNonNumeric = jest.fn().mockReturnValueOnce('123');
      const event = {
        clipboardData: {
          getData: jest.fn()
        },
        preventDefault: jest.fn()
      };
      // @ts-ignore
      instance._sendState = jest.fn();
      // @ts-ignore
      instance.onPaste(event);
    });

    // then
    it('should call _sendState method', () => {
      // @ts-ignore
      expect(instance._sendState).toHaveBeenCalled();
    });
  });

  // given
  describe('onKeyPress()', () => {
    const { instance } = securityCodeFixture();
    const event = new KeyboardEvent('keypress');

    // when
    beforeEach(() => {
      // @ts-ignore
      SecurityCode.prototype.onKeyPress = jest.fn();
      // @ts-ignore
      instance.onKeyPress(event);
    });

    // then
    it('should call onKeyPress', () => {
      // @ts-ignore
      expect(SecurityCode.prototype.onKeyPress).toHaveBeenCalledWith(event);
    });
  });

  // given
  describe('_sendState', () => {
    const { instance } = securityCodeFixture();
    it('should publish method has been called', () => {
      // @ts-ignore
      instance._sendState();
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalled();
    });
  });

  // given
  describe('_subscribeSecurityCodeChange', () => {
    const { instance } = securityCodeFixture();
    let spySecurityCodePattern: jest.SpyInstance;

    // then
    it('should return standard security code pattern', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        // @ts-ignore
        callback(SecurityCode.STANDARD_INPUT_LENGTH);
      });
      // @ts-ignore
      instance._subscribeSecurityCodeChange();
      // @ts-ignore
      spySecurityCodePattern = jest.spyOn(instance, '_setSecurityCodePattern');
      // @ts-ignore
      // expect(spySecurityCodePattern).toBeCalled();
      // @ts-ignore
      expect(instance.securityCodeLength).toEqual(SecurityCode.STANDARD_INPUT_LENGTH);
    });

    // then
    it('should set extended security code pattern', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        // @ts-ignore
        callback(SecurityCode.SPECIAL_INPUT_LENGTH);
      });
      // @ts-ignore
      instance._subscribeSecurityCodeChange();
      // @ts-ignore
      expect(instance.securityCodeLength).toEqual(SecurityCode.SPECIAL_INPUT_LENGTH);
    });
  });

  // given
  describe('_setSecurityCodePattern', () => {
    const pattern = 'some243pa%^tern';
    const { instance } = securityCodeFixture();
    // then
    it('should set pattern attribute on input field', () => {
      // @ts-ignore
      instance._setSecurityCodePattern(pattern);
      // @ts-ignore
      expect(instance._inputElement.getAttribute('pattern')).toEqual(pattern);
    });
  });
});

function securityCodeFixture() {
  const html =
    '<form id="st-security-code" class="security-code" novalidate=""><label id="st-security-code-label" for="st-security-code-input" class="security-code__label security-code__label--required">Security code</label><input id="st-security-code-input" class="security-code__input error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^[0-9]{3}$"><div id="st-security-code-message" class="security-code__message">Field is required</div></form>';
  document.body.innerHTML = html;
  const instance = new SecurityCode();
  return { instance };
}
