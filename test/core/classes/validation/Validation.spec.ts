import each from 'jest-each';
import CardNumber from '../../../../src/core/classes/validation/CardNumber.class';

each([
  [new KeyboardEvent('keypress', { key: 'a' }), 1],
  [new KeyboardEvent('keypress', { key: '0' }), 0],
  [new KeyboardEvent('keypress', { key: '"' }), 1],
  [new KeyboardEvent('keypress', { key: 'Shift' }), 1]
]).test('CardNumber.isCharNumber', (event, expected) => {
  const cn = new CardNumber();
  event.preventDefault = jest.fn();
  CardNumber.isCharNumber(event);
  expect(event.preventDefault).toHaveBeenCalledTimes(expected);
});
