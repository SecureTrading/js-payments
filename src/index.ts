import { Element } from './core/classes/Element';
import './style.scss';

const createElement = () => {
  const element = document.createElement('form');
  element.setAttribute('id', 'st-form');
  document.body.appendChild(element);
};

(() => {
  createElement();

  const cardNumber = new Element();

  cardNumber.create('cardNumber', {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        fontWeight: 600,
      },
    },
  });

  const cardNumberMounted = cardNumber.mount('st-card-number');
  cardNumber.register([cardNumberMounted], 'st-form');
})();
