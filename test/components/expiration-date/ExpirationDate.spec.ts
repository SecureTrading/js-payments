import ExpirationDate from '../../../src/components/expiration-date/ExpirationDate';
import Selectors from '../../../src/core/shared/Selectors';

// given
describe('ExpirationDate', () => {
  beforeAll(() => {
    let labelElement = document.createElement('label');
    let inputElement = document.createElement('input');
    let messageElement = document.createElement('p');

    labelElement.id = Selectors.EXPIRATION_DATE_LABEL;
    inputElement.id = Selectors.EXPIRATION_DATE_INPUT;
    messageElement.id = Selectors.EXPIRATION_DATE_MESSAGE;

    document.body.appendChild(labelElement);
    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);
  });

  // given
  describe('ifFieldExists', () => {
    // then
    it('should return input element', () => {
      expect(ExpirationDate.ifFieldExists()).toBeTruthy();
    });

    // then
    it('should return input element', () => {
      expect(ExpirationDate.ifFieldExists()).toBeInstanceOf(HTMLInputElement);
    });
  });
});

function expirationDateFixture() {
  const correctValue = '55';
  const incorrectValue = 'a';
  const correctDataValue = '12/19';
  const instance = new ExpirationDate();

  let element = document.createElement('input');
  let elementWithError = document.createElement('input');
  let elementWithExceededValue = document.createElement('input');
  element.setAttribute('value', correctValue);
  elementWithError.setAttribute('value', incorrectValue);
  elementWithExceededValue.setAttribute('value', correctDataValue);
  return { element, elementWithError, elementWithExceededValue, instance };
}
