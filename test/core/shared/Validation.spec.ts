import each from 'jest-each';
import Validation from '../../../src/core/shared/Validation';

each([
  [new KeyboardEvent('keypress', { key: 'a' }), false],
  [new KeyboardEvent('keypress', { key: '0' }), true],
  [new KeyboardEvent('keypress', { key: '"' }), false],
  [new KeyboardEvent('keypress', { key: 'Shift' }), false]
]).test('CardNumber.isCharNumber', (event: KeyboardEvent, expected: any) => {
  expect(Validation.isCharNumber(event)).toBe(expected);
});
