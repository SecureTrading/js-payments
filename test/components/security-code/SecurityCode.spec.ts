import SecurityCode from '../../../src/components/security-code/SecurityCode';
import Selectors from '../../../src/core/shared/Selectors';
import FormField from '../../../src/core/shared/FormField';

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

  it('should create instance of classes SecurityCode and FormField representing form field', () => {
    expect(securityCode).toBeInstanceOf(SecurityCode);
    FormField.prototype.getLabel = jest.fn(); // Not implemented in FormField
    expect(securityCode).toBeInstanceOf(FormField);
  });
});
