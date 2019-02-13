import Element from './core/classes/Element.class';
import './style.scss';
import './components/creditCardNumber/style.scss';
import ST from './core/classes/ST.class';

const createElement = () => {
  const element = document.createElement('form');
  element.setAttribute('id', 'st-form');
  document.body.appendChild(element);
};

(() => {
  createElement();

  const cardNumber = new Element();
  const securityCode = new Element();
  const expirationDate = new Element();

  cardNumber.create('cardNumber', {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        fontWeight: 600,
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  });

  securityCode.create('securityCode', {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        fontWeight: 600,
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  });

  expirationDate.create('expirationDate', {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        fontWeight: 600,
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  });

  const cardNumberMounted = cardNumber.mount('st-card-number');
  const securityCodeMounted = securityCode.mount('st-security-code');
  const expirationDateMounted = expirationDate.mount('st-expiration-date');
  cardNumber.register(
    [cardNumberMounted, securityCodeMounted, expirationDateMounted],
    'st-form'
  );

  const st = new ST('thisissupersecretidforaclient12344321');
})();
