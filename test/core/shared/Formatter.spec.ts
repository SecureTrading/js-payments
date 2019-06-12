import each from 'jest-each';
import Formatter from '../../../src/core/shared/Formatter';

// given
describe('Formatter', () => {
  // given
  describe('Formatter.trimNonNumeric', () => {
    // then
    const { trimNonNumeric } = formatterFixture();
    each(trimNonNumeric).it(
      'should remove whitespaces and non-numeric characters from given string',
      (given: string, expected: string) => {
        expect(Formatter.trimNonNumeric(given)).toBe(expected);
      }
    );
  });

  // given
  describe('Formatter.trimNonNumericExceptSlash', () => {
    const { trimNonNumericExceptSlash } = formatterFixture();
    // then
    each(trimNonNumericExceptSlash).it(
      'should remove whitespaces and non-numeric characters from given string except slash',
      (given: string, expected: string) => {
        expect(Formatter.trimNonNumericExceptSlash(given)).toBe(expected);
      }
    );
  });

  // given
  describe('Formatter.trimNonNumericExceptSpace', () => {
    const { trimNonNumericExceptSpace } = formatterFixture();
    // then
    each(trimNonNumericExceptSpace).it(
      'should remove whitespaces and non-numeric characters from given string except space',
      (given: string, expected: string) => {
        expect(Formatter.trimNonNumericExceptSpace(given)).toBe(expected);
      }
    );
  });

  // given
  describe('Formatter.maskExpirationDate', () => {
    const { maskExpirationDate } = formatterFixture();
    // then
    each(maskExpirationDate).it('should return given date in format MM/YY', (given: string, expected: string) => {
      expect(Formatter.maskExpirationDate(given)).toBe(expected);
    });
  });

  // given
  describe('Formatter.maskExpirationDateOnPaste', () => {
    const { maskExpirationDateOnPaste } = formatterFixture();
    beforeEach(() => {
      Formatter.maskExpirationDateOnPaste('1111');
    });
    // then
    each(maskExpirationDateOnPaste).it(
      'should return given date in format MM/YY',
      (given: string, expected: string) => {
        expect(Formatter.maskExpirationDateOnPaste(given)).toEqual(expected);
      }
    );
  });
});

function formatterFixture() {
  const trimNonNumeric = [['123', '123'], ['  1  2  3  ', '123'], ['a1A2A3a', '123'], ['a 1 A2A 3a .! ', '123']];
  const trimNonNumericExceptSlash = [['1/2', '1/2'], ['///', '///'], ['df/33', '/33'], ['@#$333!!!#', '333']];
  const trimNonNumericExceptSpace = [['a 1  A2A 3a .! ', ' 1  2 3 '], ['3 33 34 ', '3 33 34'], ['11$% 11', '11 11']];
  const maskExpirationDate = [['1', '1'], ['11', '11'], ['111', '11/1'], ['11/11', '11/11']];
  const maskExpirationDateOnPaste = [
    ['1', '1'],
    ['11', '11'],
    ['111', '11/1'],
    ['1111', '11/11'],
    ['1@23', '12/3'],
    ['==11', '11'],
    ['aa3', '3']
  ];
  return {
    maskExpirationDate,
    maskExpirationDateOnPaste,
    trimNonNumeric,
    trimNonNumericExceptSlash,
    trimNonNumericExceptSpace
  };
}
