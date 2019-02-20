import { createFormElement } from './domHelpers';

/**
 * Method for Registering element in specified clients form
 * @param fields
 * @param form
 * @constructor
 */
const RegisterElements = (fields: HTMLElement[], form: string) => {
  const formContainer = document.getElementById(form);
  const promise1 = new Promise((resolve, reject) => {
    fields.forEach(item => {
      formContainer.appendChild(item);
    });
    formContainer.appendChild(
      createFormElement('div', 'st-form__received-message')
    );
    formContainer.appendChild(
      createFormElement('button', 'st-form__submit', 'Pay Securely')
    );
    resolve('well done !');
    reject('something went wrong :(');
  });
};

export { RegisterElements };
