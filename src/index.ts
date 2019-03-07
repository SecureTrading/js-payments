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

  const st = new ST(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI1YzEyODg0NWMxMWI5MjIwZGMwNDZlOGUiLCJpYXQiOjE1NTE4Njg1NDUsImp0aSI6IjQ2LTk3MjhjZjgyMjc0NzE3NmNlZTYxY2Q0ZDBlM2YxYjE4N2Y3MWM5NTg3Nzg1MjNjNTIwNDEwMjY5NmJmMjhiNmQiLCJwYXlsb2FkIjp7Ik9yZGVyRGV0YWlscyI6eyJBbW91bnQiOjUxMTIsIkN1cnJlbmN5Q29kZSI6Ijg0MCJ9fSwiT3JnVW5pdElkIjoiNWMxMTNlOGU2ZmUzZDEyNDYwMTQxODY4In0.7_EqGOOZ1XiRMxiUgiWUUzqOzjNbX5hHpfrFxHH-F6Y',
    {},
    [
      {
        name: 'VISA',
        props: {
          apikey: 'ZG50YOGQQJ0PWPPX8D7F21ELpFID5NF-W256C638eL5hNgsOc',
          encryptionKey: 'cX8SKE8k5X#BO40elD0M4dJV65WZGqCi1+I#S$rZ'
        }
      }
    ]
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
