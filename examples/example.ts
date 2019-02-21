import { createFormElement } from '../src/core/helpers/dom';

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

const exampleElementsPage = () => {
  document.body.appendChild(createFormElement('form', 'st-form'));
  let form = document.getElementById('st-form');
  form.appendChild(
    createFormElement('h1', 'st-form__title', 'Secure Trading Example Form')
  );
  form.appendChild(createFormElement('div', 'st-card-number'));
  form.appendChild(createFormElement('div', 'st-expiration-date'));
  form.appendChild(createFormElement('div', 'st-security-code'));
  form.appendChild(createFormElement('div', 'st-form__received-message'));
  form.appendChild(
    createFormElement('button', 'st-form__submit', 'Pay Securely')
  );
};

export { elementStyles, elementClasses, exampleElementsPage };
