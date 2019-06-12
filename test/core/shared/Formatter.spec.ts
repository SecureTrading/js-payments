import Formatter from '../../../src/core/shared/Formatter';

// given
describe('Formatter', () => {
  // given
  describe('Formatter.trimNonNumeric', () => {
    // then
    it('should remove whitespaces and non-numeric characters from given string', () => {
      expect(Formatter.trimNonNumeric('123')).toBe('123');
      expect(Formatter.trimNonNumeric('  1  2  3  ')).toBe('123');
      expect(Formatter.trimNonNumeric('a1A2A3a')).toBe('123');
      expect(Formatter.trimNonNumeric('a 1 A2A 3a .! ')).toBe('123');
    });
  });

  // given
  describe('Formatter.trimNonNumericExceptSlash', () => {
    // then
    it('should remove whitespaces and non-numeric characters from given string except slash', () => {
      expect(Formatter.trimNonNumericExceptSlash('1/2')).toBe('1/2');
      expect(Formatter.trimNonNumericExceptSlash('///')).toBe('///');
      expect(Formatter.trimNonNumericExceptSlash('df/33')).toBe('/33');
    });
  });

  // given
  describe('Formatter.trimNonNumericExceptSpace', () => {
    // then
    it('should remove whitespaces and non-numeric characters from given string except space', () => {
      expect(Formatter.trimNonNumericExceptSpace('a 1git status  A2A 3a .! ')).toBe(' 1 2 3 ');
      expect(Formatter.trimNonNumericExceptSpace('3 33 34 ')).toBe('3 33 34');
    });
  });

  // given
  describe('maskExpirationDate()', () => {
    // then
    it('should return given date in format MM/YY', () => {
      expect(Formatter.maskExpirationDate('1')).toBe('1');
      expect(Formatter.maskExpirationDate('11')).toBe('11');
      expect(Formatter.maskExpirationDate('11/1')).toBe('11/1');
      expect(Formatter.maskExpirationDate('11/11')).toBe('11/11');
    });
  });
});

function formatterFixture() {
  return {};
}
