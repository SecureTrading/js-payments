import { Element } from './core/classes/Element';
import './style.scss';
import { getStylesFromUrl } from './core/validation/iframe/iframe.ts';

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

  getStylesFromUrl(
    '//localhost:8081/cardNumber.html?"style[border]=none&style[margin]=0&style[padding]=0&style[width]=1px&style[minWidth]=100%&style[overflow]=hidden&style[display]=block&style[height]=120px'
  );
})();
