import Formatter from '../../../src/core/shared/Formatter';

describe('Formatter', () => {
  describe('trimNonNumeric()', () => {
    it('should remove whitespaces and non-numeric characters from given string', () => {
      expect(Formatter.trimNonNumeric('123')).toBe('123');
      expect(Formatter.trimNonNumeric('  1  2  3  ')).toBe('123');
      expect(Formatter.trimNonNumeric('a1A2A3a')).toBe('123');
      expect(Formatter.trimNonNumeric('a 1 A2A 3a .! ')).toBe('123');
    });
  });

  describe('maskExpirationDate()', () => {
    it('should return given date in format MM/YY', () => {
      expect(Formatter.maskExpirationDate('1')).toBe('1');
      expect(Formatter.maskExpirationDate('11')).toBe('11');
      expect(Formatter.maskExpirationDate('11/1')).toBe('11/1');
      expect(Formatter.maskExpirationDate('11/11')).toBe('11/11');
    });
  });
});
