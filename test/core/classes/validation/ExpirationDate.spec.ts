import ExpirationDate from './../../../../src/core/classes/validation/ExpirationDate.class';
// given
describe('ExpirationDate class', () => {
  let instance: object,
    dateMaxLength: number,
    dateSlashPlace: number,
    expirationDateRegexp: string,
    element: object;

  // given
  describe('ExpirationDate class instance', () => {
    // then
    it('should new object be an instance od ExpirationDate class', () => {
      expect(instance).toBeInstanceOf(ExpirationDate);
    });
  });

  // given
  describe('dateInputMask method', () => {
    // when
    beforeEach(() => {
      instance = new ExpirationDate();
      dateMaxLength = 5;
      dateSlashPlace = 2;
      expirationDateRegexp = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';
      element = elementFixture();
      event = eventFixture();
    });

    // then
    it('should prevent from exceed max length of date', () => {});

    // then
    it('should indicate slash at third place of indicated string', () => {});

    // then
    it('should prevent from enter char except digit', () => {});
  });

  // given
  describe('isDateValid method', () => {
    // when
    beforeEach(() => {});

    // then
    it('should return false if non-digit expression is indicated', () => {});

    // then
    it('should return true if digit expression is indicated', () => {});
  });
});

function elementFixture() {
  let element = document.createElement('input').setAttribute('value', '55');
  return { element };
}

function eventFixture() {
  const event = {
    preventDefault: jest.fn()
  };
  return { event };
}
