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
      color: '#495057',
      fontFamily: 'Montserrat, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      fontWeight: 700,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      borderColor: '#ced4da',
      padding: '6px 12px 6px 20px',
      lineHeight: '1.5',
      backgroundColor: '#fff',
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
