import { elementClasses, elementStyles } from '../examples/example';
import '../examples/example.scss'; // this is loaded only for example purposes
import Element from './core/classes/Element.class';
import ST from './core/classes/ST.class';
import { RegisterElements } from './core/helpers/mount';
import { iframesEndpoints } from './core/imports/iframe';
import { submitListener } from './core/listeners/submit';

(() => {
  submitListener('st-card-number-iframe', iframesEndpoints.cardNumber);
  submitListener('st-security-code-iframe', iframesEndpoints.securityCode);
  submitListener('st-expiration-date-iframe', iframesEndpoints.expirationDate);

  const st = new ST('jdsjkandsjakndjksa', {}, [
    {
      name: 'VISA',
      props: {
        apiKey: 'ZG50YOGQQJ0PWPPX8D7F21ELpFID5NF-W256C638eL5hNgsOc',
        encryptionKey: 'cX8SKE8k5X#BO40elD0M4dJV65WZGqCi1+I#S$rZ'
      }
    }
  ]);

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
