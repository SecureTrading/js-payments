import SecurityCode from '../../../src/components/security-code/SecurityCode';
import Selectors from "../../../src/core/shared/Selectors";
import FormField from "../../../src/core/shared/FormField";

describe('SecurityCode', () => {
  let securityCode: SecurityCode;

  beforeAll(() => {
    let inputElement = document.createElement('input');
    let messageElement = document.createElement('p');

    inputElement.id = Selectors.SECURITY_CODE_INPUT_SELECTOR;
    messageElement.id = Selectors.SECURITY_CODE_MESSAGE_SELECTOR;

    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);

    securityCode = new SecurityCode();
  });

  it('should create instance of classes SecurityCode and FormField representing form field', () => {
    expect(securityCode).toBeInstanceOf(SecurityCode);
    expect(securityCode).toBeInstanceOf(FormField);
  });
});
