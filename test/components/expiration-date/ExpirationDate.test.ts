import ExpirationDate from '../../../src/components/expiration-date/ExpirationDate';
import FormField from '../../../src/core/shared/FormField';
import Selectors from '../../../src/core/shared/Selectors';

describe('ExpirationDate', () => {
  let expirationDate: ExpirationDate;

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

    expirationDate = new ExpirationDate();
  });

  it('should create instance of classes ExpirationDate and FormField representing form field', () => {
    expect(expirationDate).toBeInstanceOf(ExpirationDate);
    expect(expirationDate).toBeInstanceOf(FormField);
  });

  // // given
  // describe('Class ExpirationDate instance', () => {
  //   // when
  //   beforeEach(() => {
  //     instance = new ExpirationDate('st-expiration-date-input');
  //     expirationDateClass = ExpirationDate;
  //     validationClass = Validation;
  //   });
  //   // then
  //   it('should new object be an instance od ExpirationDate and Validation class', () => {
  //     expect(instance).toBeInstanceOf(ExpirationDate);
  //     expect(instance).toBeInstanceOf(Validation);
  //   });
  // });

  // given
  // describe('Method dateInputMask', () => {
  //   // when
  //   let expectedValueWithSlash: string;
  //   let keyPressedValue: string;
  //   let keyPressedValueIncorrect: string;
  //
  //   beforeEach(() => {
  //     expectedValueWithSlash = '55/';
  //     keyPressedValue = '0';
  //     keyPressedValueIncorrect = 'a';
  //   });
  //
  //   // then
  //   it('should prevent from exceed max length of date', () => {
  //     let { elementWithExceededValue } = elementFixture();
  //     const { event } = eventFixture('keypress', keyPressedValue);
  //     // expect(ExpirationDate.dateInputMask(elementWithExceededValue, event)).toBe(false);
  //   });
  //
  //   // then
  //   it('should indicate slash at third place of indicated string', () => {
  //     let { element } = elementFixture();
  //     const { event } = eventFixture('keypress', keyPressedValue);
  //     // ExpirationDate.dateInputMask(element, event);
  //     expect(element.value).toBe(expectedValueWithSlash);
  //   });
  //
  //   // then
  //   it('should prevent from enter char except digit', () => {
  //     let { element } = elementFixture();
  //     let { event } = eventFixture('keypress', keyPressedValueIncorrect);
  //     // let expirationDateResult = ExpirationDate.dateInputMask(element, event);
  //     // expect(expirationDateResult).toBe(false);
  //   });
  // });

  // given
  // describe('Method isDateValid', () => {
  //   //when
  //   const { element, elementWithError } = elementFixture();
  //
  //   // then
  //   it('should return false if non-digit expression is indicated', () => {
  //     // expect(ExpirationDate.isDateValid(elementWithError)).toEqual(false);
  //   });
  //
  //   // then
  //   it('should return true if digit expression is indicated', () => {
  //     // expect(ExpirationDate.isDateValid(element)).toEqual(false);
  //   });
  // });
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
  const event = new KeyboardEvent(eventType, { key: eventKeyValue });
  return { event };
}
