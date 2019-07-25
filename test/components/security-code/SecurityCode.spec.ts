import SecurityCode from '../../../src/components/security-code/SecurityCode';
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

  // then
  describe('init', () => {
    // then
    it('should create instance of classes SecurityCode and FormField representing form field', () => {
      expect(securityCode).toBeInstanceOf(SecurityCode);
      expect(securityCode).toBeInstanceOf(FormField);
    });
  });

  // then
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

  // then
  describe('getLabel', () => {
    // then
    it('should have a label', () => {
      expect(securityCode.getLabel()).toBe('Security code');
    });
  });

  // given
  describe('setFocusListener', () => {
    const { instance } = SecurityCodeFixture();
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
    const { instance } = SecurityCodeFixture();
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
    const { instance } = SecurityCodeFixture();
    // @ts-ignore
    const spySendState = jest.spyOn(instance, 'sendState');

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
    const { instance } = SecurityCodeFixture();
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
    const { instance } = SecurityCodeFixture();
    // @ts-ignore
    const spySendState = jest.spyOn(instance, 'sendState');
    const event = new Event('input');

    beforeEach(() => {});

    // then
    it('should call sendState', () => {
      // @ts-ignore
      instance._inputElement.value = '12';
      // @ts-ignore
      instance.onInput(event);
      expect(spySendState).toHaveBeenCalled();
    });

    // then
    it('should trim too long value', () => {
      // @ts-ignore
      instance._inputElement.value = '1234';
      // @ts-ignore
      instance.onInput(event);
      // @ts-ignore
      expect(instance._inputElement.value).toEqual('123');
    });
  });

  // given
  describe('sendState', () => {
    const { instance } = SecurityCodeFixture();
    it('should publish method has been called', () => {
      // @ts-ignore
      instance.sendState();
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalled();
    });
  });

  // given
  describe('subscribeSecurityCodeChange', () => {
    const { instance } = SecurityCodeFixture();
    let spySecurityCodePattern: jest.SpyInstance;

    // then
    it('should return standard security code pattern', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        // @ts-ignore
        callback(SecurityCode.STANDARD_INPUT_LENGTH);
      });
      // @ts-ignore
      instance.subscribeSecurityCodeChange();
      // @ts-ignore
      spySecurityCodePattern = jest.spyOn(instance, 'setSecurityCodePattern');
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
      instance.subscribeSecurityCodeChange();
      // @ts-ignore
      expect(instance.securityCodeLength).toEqual(SecurityCode.SPECIAL_INPUT_LENGTH);
    });
  });

  // given
  describe('setSecurityCodePattern', () => {
    const pattern = 'some243pa%^tern';
    const { instance } = SecurityCodeFixture();
    // then
    it('should set pattern attribute on input field', () => {
      // @ts-ignore
      instance.setSecurityCodePattern(pattern);
      // @ts-ignore
      expect(instance._inputElement.getAttribute('pattern')).toEqual(pattern);
    });
  });
});

function SecurityCodeFixture() {
  const html =
    '<form id="st-security-code" class="security-code" novalidate=""><label id="st-security-code-label" for="st-security-code-input" class="security-code__label security-code__label--required">Security code</label><input id="st-security-code-input" class="security-code__input error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^[0-9]{3}$"><div id="st-security-code-message" class="security-code__message">Field is required</div></form>';
  document.body.innerHTML = html;
  const instance = new SecurityCode();
  return { instance };
}
