import '../example/style.scss';
import { Element, RegisterElements } from './core/classes/Element.class';
import Payment from './core/classes/Payment.class';
import ST from './core/classes/ST.class';
import {
  createFormElement,
  elementClasses,
  elementStyles,
} from '../example';

(() => {
  const st = new ST('thisissupersecretidforaclient12344321');
  const payment = new Payment(['ApplePay', 'GooglePay'], ['133456', '546565']);
  document.body.appendChild(createFormElement('form', 'st-form'));
  document
    .getElementById('st-form')
    .appendChild(
      createFormElement('h1', 'st-form__title', 'Secure Trading Example Form')
    );

  const cardNumber = new Element();
  const securityCode = new Element();
  const expirationDate = new Element();

  cardNumber.create('cardNumber', {
    style: elementStyles,
    classes: elementClasses,
  });
  const cardNumberMounted = cardNumber.mount('st-card-number');

  securityCode.create('securityCode', {
    style: elementStyles,
    classes: elementClasses,
  });
  const securityCodeMounted = securityCode.mount('st-security-code');

  expirationDate.create('expirationDate', {
    style: elementStyles,
    classes: elementClasses,
  });
  const expirationDateMounted = expirationDate.mount('st-expiration-date');

  RegisterElements(
    [cardNumberMounted, securityCodeMounted, expirationDateMounted],
    'st-form'
  );
  document
    .getElementById('st-form')
    .appendChild(createFormElement('div', 'st-form__received-message'));
  document
    .getElementById('st-form')
    .appendChild(
      createFormElement('button', 'st-form__submit', 'Pay Securely')
    );
})();
