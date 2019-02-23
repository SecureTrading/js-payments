import { elementClasses, elementStyles } from '../examples/example';
import '../example/style.scss'; // this is loaded only for example purposes
import Element from './core/classes/Element.class';
import Payment from './core/classes/Payment.class';
import ST from './core/classes/ST.class';
import { RegisterElements } from './core/helpers/mount';
import { iframesEndpoints } from './core/imports/iframe';
import { submitListener } from './core/listeners/submit';

(() => {
  submitListener('st-card-number-iframe', iframesEndpoints.cardNumber);
  submitListener('st-security-code-iframe', iframesEndpoints.securityCode);
  submitListener('st-expiration-date-iframe', iframesEndpoints.expirationDate);

  const st = new ST('thisissupersecretidforaclient12344321');
  const payment = new Payment(
    ['ApplePay', 'Visa Checkout'],
    ['133456', '546565']
  );

  const cardNumber = new Element();
  const securityCode = new Element();
  const expirationDate = new Element();

  cardNumber.create('cardNumber', {
    classes: elementClasses,
    style: elementStyles
  });
  const cardNumberMounted = cardNumber.mount('st-card-number-iframe');

  securityCode.create('securityCode', {
    classes: elementClasses,
    style: elementStyles
  });
  const securityCodeMounted = securityCode.mount('st-security-code-iframe');

  expirationDate.create('expirationDate', {
    classes: elementClasses,
    style: elementStyles
  });
  const expirationDateMounted = expirationDate.mount(
    'st-expiration-date-iframe'
  );

  RegisterElements(
    [cardNumberMounted, securityCodeMounted, expirationDateMounted],
    ['st-card-number', 'st-security-code', 'st-expiration-date']
  );
})();
