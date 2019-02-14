import Element from './core/classes/Element.class';
import './style.scss';
import './components/creditCardNumber/style.scss';
import Payment from './core/classes/Payment.class';
import ST from './core/classes/ST.class';

const elementStyles = {
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
  invalid: {
    color: '#fff',
    ':focus': {
      color: '#FA755A',
    },
    '::placeholder': {
      color: '#FFCCA5',
    },
  },
};
const elementClasses = {
  focus: 'focus',
  empty: 'empty',
  invalid: 'invalid',
};

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

  cardNumber.register(
    [cardNumberMounted, securityCodeMounted, expirationDateMounted],
    'st-form'
  );

  const st = new ST('thisissupersecretidforaclient12344321');
  const payment = new Payment(['ApplePay', 'GooglePay'], ['133456', '546565']);
})();
