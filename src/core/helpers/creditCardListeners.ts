import { formatCreditCard } from '../imports/cards';
import {
  appEndpoint,
  getStylesFromUrl,
  iframesEndpoints,
} from '../imports/iframe';

const { cardNumber } = iframesEndpoints;

const creditCardDOMListener = () => {
  document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById(
      'st-credit-card-number'
    ) as HTMLFormElement;
    let creditCardInput = <HTMLInputElement>(
      document.getElementById('credit-card-number')
    );
    let styles = getStylesFromUrl();
    Object.assign(creditCardInput.style, styles.style.style.base);

    window.addEventListener(
      'message',
      event => {
        if (event.origin !== cardNumber) {
          let isFormValid = Object.values(creditCardInput.validity).some(
            item => item
          );
          if (isFormValid) {
            form.submit();
          } else {
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
      creditCardInput.value = formatCreditCard(
        (<HTMLInputElement>event.target).value
      );
    });
  });
};

export { creditCardDOMListener };
