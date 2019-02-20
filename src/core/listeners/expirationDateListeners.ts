import { appEndpoint, applyStylesToIframe } from '../imports/iframe';
import ExpireDate from './../classes/validation/ExpireDate.class';
import { iframesEndpoints } from '../imports/iframe';

const { expirationDate } = iframesEndpoints;

const expireDateDOMListener = () => {
  document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById('st-expiration-date') as HTMLFormElement;
    let expirationDateInput = <HTMLInputElement>(
      document.getElementById('expiration-date')
    );
    applyStylesToIframe('expiration-date', `${expirationDate}/?`);

    window.addEventListener(
      'message',
      event => {
        if (event.origin !== expirationDate) {
          let isFormValid = Object.values(expirationDateInput.validity).some(
            item => item
          );
          if (isFormValid) {
            form.submit();
          } else {
            parent.postMessage(
              { isEmpty: expirationDateInput.validity.valueMissing },
              appEndpoint
            );
          }
        }
      },
      true
    );

    expirationDateInput.addEventListener('keyup', (event: Event) => {
      let value = (<HTMLInputElement>event.target).value;
      if (value.length > 10) {
        event.preventDefault();
        return;
      }
      expirationDateInput.value = value.replace(
        /^([\d]{2})([\d]{2})$/,
        '$1/$2'
      );
    });
  });
};

export { expireDateDOMListener };
