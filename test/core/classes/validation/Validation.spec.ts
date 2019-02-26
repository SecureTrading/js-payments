import each from 'jest-each';
import CardNumber from '../../../../src/core/classes/validation/CardNumber.class';

each([
  [new KeyboardEvent('keypress', { key: 'a' }), false],
  [new KeyboardEvent('keypress', { key: '0' }), true],
  [new KeyboardEvent('keypress', { key: '"' }), false],
  [new KeyboardEvent('keypress', { key: 'Shift' }), false]
]).test('CardNumber.isCharNumber', (event: KeyboardEvent, expected: any) => {
  expect(CardNumber.isCharNumber(event)).toBe(expected);
});
