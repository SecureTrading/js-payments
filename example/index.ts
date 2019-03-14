/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import './style.scss';
import { Element, ST } from '../src/stjs';

(() => {
  const st = new ST();
  const cardNumber = new Element();
  const securityCode = new Element();
  const expirationDate = new Element();

  cardNumber.create('cardNumber');
  const cardNumberMounted = cardNumber.mount('st-card-number-iframe');

  securityCode.create('securityCode');
  const securityCodeMounted = securityCode.mount('st-security-code-iframe');

  expirationDate.create('expirationDate');
  const expirationDateMounted = expirationDate.mount('st-expiration-date-iframe');

  st.registerElements(
    [cardNumberMounted, securityCodeMounted, expirationDateMounted],
    ['st-card-number', 'st-security-code', 'st-expiration-date']
  );
})();
