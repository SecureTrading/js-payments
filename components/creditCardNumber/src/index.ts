import './style.css';
import { iframesEndpoints, appEndpoint } from '../../../src/core/imports/iframe';

const { cardNumber } = iframesEndpoints;

document.addEventListener('DOMContentLoaded', () => {
  let form = document.getElementById('st-credit-card-number');
  let creditCardInput = document.getElementById('credit-card-number');
  let styles = getStylesFromUrl();
  Object.assign(creditCardInput.style, styles.style.style.base);

  window.addEventListener('message', (event) => {
    if (event.origin !== cardNumber) {
      // @ts-ignore
      let isFormValid = Object.values(creditCardInput.validity).some((item) => item);
      if (isFormValid) {
        // @ts-ignore
        form.submit();
      } else {
        // @ts-ignore
        parent.postMessage({ isEmpty: creditCardInput.validity.valueMissing }, appEndpoint);
      }
    }
  }, true);
});

const getStylesFromUrl = () => {
  let query = window.location.href;
  query = decodeURI(query).replace(/&/g, '","').replace(/=/g, '":"').replace('http://localhost:8081/?', '');
  console.log(JSON.parse(query));
  return JSON.parse(query);
};
