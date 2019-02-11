import { Elements } from './core/classes/Elements';
import './style.scss';

const createElement = () => {
  const element = document.createElement('form');
  element.setAttribute('id', 'st-form');
  document.body.appendChild(element);
};

const registerFields = (fields: [HTMLIFrameElement], form: string) => {
  const formContainer = document.getElementById(form);
  const promise1 = new Promise((resolve, reject) => {
    fields.forEach(item => {
      formContainer.appendChild(item);
    });
    resolve('sukces');
    reject('something went wrong');
  });
};

(() => {
  createElement();

  const cardNumber = new Elements();

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

  registerFields([cardNumberMounted], 'st-form');
})();
