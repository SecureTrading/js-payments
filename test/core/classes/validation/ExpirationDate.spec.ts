import Validation from '../../../../src/core/classes/validation/Validation.class';
import ExpirationDate from './../../../../src/core/classes/validation/ExpirationDate.class';

// given
describe('ExpirationDate class', () => {
  let instance: object, expirationDateClass: any, validationClass: any;

  // given
  describe('Class ExpirationDate instance', () => {
    // when
    beforeEach(() => {
      instance = new ExpirationDate();
      expirationDateClass = ExpirationDate;
      validationClass = Validation;
    });
    // then
    it('should new object be an instance od ExpirationDate and Validation class', () => {
      expect(instance).toBeInstanceOf(ExpirationDate);
      expect(instance).toBeInstanceOf(Validation);
    });
  });

  // given
  describe('Method dateInputMask', () => {
    // when
    let expectedValueWithSlash: string,
      keyPressedValue: string,
      keyPressedValueIncorrect: string;

    beforeEach(() => {
      expectedValueWithSlash = '55/';
      keyPressedValue = '0';
      keyPressedValueIncorrect = 'a';
    });

    // then
    it('should prevent from exceed max length of date', () => {
      let { elementWithExceededValue } = elementFixture();
      const { event } = eventFixture('keypress', keyPressedValue);
      expect(
        ExpirationDate.dateInputMask(elementWithExceededValue, event)
      ).toBe(false);
    });

    // then
    it('should indicate slash at third place of indicated string', () => {
      let { element } = elementFixture();
      const { event } = eventFixture('keypress', keyPressedValue);
      ExpirationDate.dateInputMask(element, event);
      expect(element.value).toBe(expectedValueWithSlash);
    });

    // then
    it('should prevent from enter char except digit', () => {
      let { element } = elementFixture();
      let { event } = eventFixture('keypress', keyPressedValueIncorrect);
      let expirationDateResult = ExpirationDate.dateInputMask(element, event);
      expect(expirationDateResult).toBe(false);
    });
  });

  // given
  describe('Method isDateValid', () => {
    //when
    const { element, elementWithError } = elementFixture();

    // then
    it('should return false if non-digit expression is indicated', () => {
      expect(ExpirationDate.isDateValid(elementWithError)).toEqual(false);
    });

    // then
    it('should return true if digit expression is indicated', () => {
      expect(ExpirationDate.isDateValid(element)).toEqual(false);
    });
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
