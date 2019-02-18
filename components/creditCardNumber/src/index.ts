import './style.scss';
import {
  iframesEndpoints,
  appEndpoint,
} from '../../../src/core/imports/iframe';

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

const getStylesFromUrl = () => {
  let query = window.location.href;
  query = decodeURI(query)
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
    .replace('http://localhost:8081/?', '');
  console.log(JSON.parse(query));
  return JSON.parse(query);
};

const formatCreditCard = (cc: string) => {
  // @ts-ignore
  if (event.keyCode < 47 || event.keyCode > 57) {
    event.preventDefault();
  }
  let v = cc.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let matches = v.match(/\d{4,16}/g);
  let match = (matches && matches[0]) || '';
  let parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : cc;
};
