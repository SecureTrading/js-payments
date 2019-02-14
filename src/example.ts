/***
 *  Here will be all function just for initializing examples
 */

const createElement = () => {
  const element = document.createElement('form');
  element.setAttribute('id', 'st-form');
  const button = document.createElement('button');
  button.setAttribute('type', 'submit');
  button.innerHTML = 'Pay securely';
  document.body.appendChild(element);
  const form = document.getElementById('st-form');
  form.appendChild(button);
};
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

export { createElement, elementStyles, elementClasses };
