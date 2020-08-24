import { Formatter } from './Formatter';
import { EXPIRATION_DATE_INPUT } from '../../models/constants/Selectors';
import { MessageBus } from '../message-bus/MessageBus';
import { mock } from 'ts-mockito';
import { Frame } from '../frame/Frame';

jest.mock('./../notification/Notification');

// given
describe('Formatter', () => {
  describe('date', () => {
    const { instance } = formatterFixture();
    it('should return fixed date', () => {
      expect(instance.date('123', EXPIRATION_DATE_INPUT)).toEqual('12/3');
    });
  });
});

function formatterFixture() {
  const html =
    '<form id="st-expiration-date" class="expiration-date" novalidate=""> <label id="st-expiration-date-label" for="st-expiration-date-input" class="expiration-date__label expiration-date__label--required">Expiration date</label> <input id="st-expiration-date-input" class="expiration-date__input st-error-field" type="text" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="numeric" required="" data-dirty="true" data-pristine="false" data-validity="false" data-clicked="false" pattern="^(0[1-9]|1[0-2])\\/([0-9]{2})$"> <div id="st-expiration-date-message" class="expiration-date__message">Field is required</div> </form>';
  document.body.innerHTML = html;
  const messageBus: MessageBus = mock(MessageBus);
  const frame: Frame = mock(Frame);
  const instance = new Formatter();
  const trimNonNumeric = [
    ['123', '123'],
    ['  1  2  3  ', '123'],
    ['a1A2A3a', '123'],
    ['a 1 A2A 3a .! ', '123']
  ];
  const trimNonNumericExceptSlash = [
    ['1/2', '1/2'],
    ['///', '///'],
    ['df/33', '/33'],
    ['@#$333!!!#', '333']
  ];
  const trimNonNumericExceptSpace = [
    ['a 1  A2A 3a .! ', ' 1  2 3 '],
    ['3 33 34 ', '3 33 34'],
    ['11$% 11', '11 11']
  ];
  const maskExpirationDate = [
    ['1', '1'],
    ['11', '11'],
    ['111', '11/1'],
    ['11/11', '11/11']
  ];
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
    instance,
    maskExpirationDate,
    maskExpirationDateOnPaste,
    trimNonNumeric,
    trimNonNumericExceptSlash,
    trimNonNumericExceptSpace
  };
}
