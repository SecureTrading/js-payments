import { Element, RegisterElements } from './core/classes/Element.class';
import './components/creditCardNumber/style.scss';
import Payment from './core/classes/Payment.class';
import ST from './core/classes/ST.class';
import { createElement, elementStyles, elementClasses } from './example';

(() => {
  const st = new ST('thisissupersecretidforaclient12344321');
  const payment = new Payment(['ApplePay', 'GooglePay'], ['133456', '546565']);

  createElement();

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
