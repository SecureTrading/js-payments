import './style.scss';
import {
  appEndpoint,
  iframesEndpoints,
  getStylesFromUrl,
} from '../../../src/core/imports/iframe';
import { formatCreditCard } from './../../../src/core/imports/cards';

const { cardNumber } = iframesEndpoints;

document.addEventListener('DOMContentLoaded', () => {
  let form = document.getElementById('st-credit-card-number');
  let creditCardInput = document.getElementById('credit-card-number');
  let styles = getStylesFromUrl();
  Object.assign(creditCardInput.style, styles.style.style.base);

  window.addEventListener(
    'message',
    event => {
      if (event.origin !== cardNumber) {
        // @ts-ignore
        let isFormValid = Object.values(creditCardInput.validity).some(
          item => item
        );
        if (isFormValid) {
          // @ts-ignore
          form.submit();
        } else {
          // @ts-ignore
          parent.postMessage(
            { isEmpty: creditCardInput.validity.valueMissing },
            appEndpoint
          );
        }
      }
    },
    true
  );

  creditCardInput.addEventListener('keyup', event => {
    //@ts-ignore
    creditCardInput.value = formatCreditCard(event.target.value);
  });
});
