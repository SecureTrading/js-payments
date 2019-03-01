import Validation from '../../../../src/core/classes/validation/Validation.class';
import ExpirationDate from './../../../../src/core/classes/validation/ExpirationDate.class';

// given
describe('ExpirationDate class', () => {
  let instance: object;
  let expirationDateClass: any;
  let validationClass: any;
  const fieldId: string = 'expiration-date';

  // given
  describe('Class ExpirationDate instance', () => {
    // when
    beforeEach(() => {});
    // then
    it('should new object be an instance od ExpirationDate and Validation class', () => {});
  });

  // given
  describe('Method dateInputMask', () => {
    // when
    let expectedValueWithSlash: string;
    let keyPressedValue: string;
    let keyPressedValueIncorrect: string;

    beforeEach(() => {
      expectedValueWithSlash = '55/';
      keyPressedValue = '0';
      keyPressedValueIncorrect = 'a';
    });

    // then
    it('should prevent from exceed max length of date', () => {});

    // then
    it('should indicate slash at third place of indicated string', () => {});

    // then
    it('should prevent from enter char except digit', () => {});
  });

  // given
  describe('Method inputValidation', () => {
    // then
    it('should set pattern attribute for date input', () => {});
  });
});

function elementFixture() {
  const correctValue = '55';
  const incorrectValue = 'a';
  const correctDataValue = '12/19';

  let element = document.createElement('input');
  let elementWithError = document.createElement('input');
  let elementWithExceededValue = document.createElement('input');
  element.setAttribute('value', correctValue);
  elementWithError.setAttribute('value', incorrectValue);
  elementWithExceededValue.setAttribute('value', correctDataValue);
  return { element, elementWithError, elementWithExceededValue };
}

function eventFixture(eventType: string, eventKeyValue: string) {
  const event = new KeyboardEvent('keypress', { key: eventKeyValue });
  return { event };
}
