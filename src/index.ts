import '../examples/example.scss'; // this is loaded only for example purposes
import Element from './core/classes/Element.class';
import Payment from './core/classes/Payment.class';
import ST from './core/classes/ST.class';
import { RegisterElements } from './core/helpers/mount';
import {
  elementClasses,
  elementStyles,
  exampleElementsPage,
} from '../examples/example';
import { iframesEndpoints } from './core/imports/iframe';
import { submitListener } from './core/listeners/submit';

(() => {
  exampleElementsPage(); // this is loaded only for example purposes
  submitListener('st-card-number', iframesEndpoints.cardNumber);
  submitListener('st-security-code', iframesEndpoints.securityCode);
  submitListener('st-expiration-date', iframesEndpoints.expirationDate);

  const st = new ST('thisissupersecretidforaclient12344321');
  const payment = new Payment(
    ['ApplePay', 'Visa Checkout'],
    ['133456', '546565']
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
    ['st-card-number', 'st-security-code', 'st-expiration-date']
  );
})();
