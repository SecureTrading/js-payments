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
  describe('onInput', () => {});

  // given
  describe('onPaste', () => {
    const { instance } = securityCodeFixture();

    // then
    it('should isMaxLengthReached method has been called', () => {});
  });

  // given
  describe('onKeyPress', () => {
    const { instance } = securityCodeFixture();
    // @ts-ignore
    instance.securityCodeLength = 4;
    // @ts-ignore
    const spy = jest.spyOn(instance, 'isMaxLengthReached');
    // @ts-ignore
    const event = new KeyboardEvent('keydown', { keyCode: 37 });
    const spyPrevent = jest.spyOn(event, 'preventDefault');
    // then
    it('should isMaxLengthReached method has been called', () => {
      // @ts-ignore
      instance.onKeyPress(event);
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should preventDefault method has been called', () => {
      // @ts-ignore
      instance.onKeyPress(event);
      // expect(spyPrevent).toHaveBeenCalled();
    });
  });

  // given
  describe('sendState', () => {
    const { instance } = securityCodeFixture();
    it('should publish method has been called', () => {
      // @ts-ignore
      instance.sendState();
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalled();
    });
  });

  // given
  describe('subscribeSecurityCodeChange', () => {
    const { instance } = securityCodeFixture();
    beforeEach(() => {
      // @ts-ignore
      instance.subscribeSecurityCodeChange();
    });
    // then
    it('should call publish method', () => {
      // @ts-ignore
      expect(instance._messageBus.subscribe).toHaveBeenCalled();
    });

    // then
    it('should set default security code length if non Amex', () => {
      // @ts-ignore
      expect(instance.securityCodeLength).toEqual(SecurityCode.STANDARD_INPUT_LENGTH);
    });

    // then
    it('should call setSecurityCodePattern function', () => {
      // @ts-ignore
      // expect(spy).toHaveBeenCalled();
    });
    // then
    it('should return input pattern', () => {});
  });

  // given
  describe('setSecurityCodePattern', () => {
    const pattern = 'some243pa%^tern';
    const { instance } = securityCodeFixture();
    // @ts-ignore
    instance.setSecurityCodePattern(pattern);
    // then
    it('should set pattern attribute on input field', () => {
      // @ts-ignore
      expect(instance._inputElement.getAttribute('pattern')).toEqual(pattern);
    });
  });

  // given
  describe('isMaxLengthReached', () => {
    const { instance } = securityCodeFixture();
    let value = '123';
    let valueMax = '1234';
    // when
    beforeEach(() => {
      // @ts-ignore
      instance.securityCodeLength = 4;
    });

    // then
    it('should return false if max length has not been reached', () => {
      // @ts-ignore
      instance._inputElement.value = value;
      // @ts-ignore
      expect(instance.isMaxLengthReached()).toEqual(false);
    });

    // then
    it('should return true if max length has been reached', () => {
      const { instance } = securityCodeFixture();
      // @ts-ignore
      instance._inputElement.value = valueMax;
      // @ts-ignore
      expect(instance.isMaxLengthReached()).toEqual(true);
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
