import '../examples/example.scss';
import { Element } from './core/classes/Element.class';
import { RegisterElements } from './core/helpers/mountHelpers';
import Payment from './core/classes/Payment.class';
import ST from './core/classes/ST.class';
import {
  createFormElement,
  elementClasses,
  elementStyles,
} from '../examples/example';
import { submitListener } from './core/listeners/submitListeners';

document.addEventListener('DOMContentLoaded', () => {
  submitListener('st-card-number');
});

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
})();
