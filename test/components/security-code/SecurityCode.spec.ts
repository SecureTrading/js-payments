import CardNumber from '../../../src/components/card-number/CardNumber';
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
      FormField.prototype.getLabel = jest.fn(); // Not implemented in FormField
      expect(securityCode).toBeInstanceOf(FormField);
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
  describe('backendValidation', () => {
    // then
    it('', () => {});
  });

  // given
  describe('setFocusListener', () => {
    // then
    it('', () => {});
  });

  // given
  describe('setDisableListener', () => {
    // then
    it('', () => {});
  });

  // given
  describe('onBlur', () => {
    // then
    it('', () => {});
  });

  // given
  describe('onInput', () => {
    // then
    it('', () => {});
  });

  // given
  describe('onPaste', () => {
    // then
    it('', () => {});
  });

  // given
  describe('onKeyPress', () => {
    // then
    it('', () => {});
  });

  // given
  describe('sendState', () => {
    // then
    it('', () => {});
  });

  // given
  describe('subscribeSecurityCodeChange', () => {
    // then
    it('', () => {});
  });

  // given
  describe('setSecurityCodeAttributes', () => {
    // then
    it('', () => {});
  });

  // given
  describe('isMaxLengthReached', () => {
    // then
    it('should return false if max lenght has not been reached', () => {
      const { instance } = securityCodeFixture();
      // @ts-ignore
      // instance._inputElement.value.length = 2;
      // @ts-ignore
      expect(instance.isMaxLengthReached()).toEqual(false);
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
