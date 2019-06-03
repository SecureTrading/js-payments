import ExpirationDate from '../../../src/components/expiration-date/ExpirationDate';
import Language from '../../../src/core/shared/Language';
import Selectors from '../../../src/core/shared/Selectors';

jest.mock('./../../../src/core/shared/MessageBus');

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

  // given
  describe('ExpirationDate.getLabel', () => {
    const { instance } = expirationDateFixture();
    // then
    it('should return translated label', () => {
      expect(instance.getLabel()).toEqual(Language.translations.LABEL_EXPIRATION_DATE);
    });
  });

  // given
  describe('ExpirationDate.isMaxLengthReached ', () => {
    const { instance } = expirationDateFixture();
    // then
    it('should return true if input value greater than date length', () => {
      // @ts-ignore
      instance._inputElement.value = '12/12';
      // @ts-ignore;
      expect(instance.isMaxLengthReached()).toEqual(true);
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
  const instance = new ExpirationDate();

  let element = document.createElement('input');
  let elementWithError = document.createElement('input');
  let elementWithExceededValue = document.createElement('input');
  element.setAttribute('value', correctValue);
  elementWithError.setAttribute('value', incorrectValue);
  elementWithExceededValue.setAttribute('value', correctDataValue);
  return { element, elementWithError, elementWithExceededValue, instance };
}
