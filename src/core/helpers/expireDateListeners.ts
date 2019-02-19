import { applyStylesToIframe } from '../imports/iframe';
import ExpireDate from './../classes/validation/ExpireDate.class';
import { iframesEndpoints } from '../imports/iframe';

const expireDateDOMListener = () => {
  document.addEventListener('DOMContentLoaded', () => {
    let expirationDateInput = <HTMLInputElement>(
      document.getElementById('expiration-date')
    );
    applyStylesToIframe(
      'expiration-date',
      `${iframesEndpoints.securityCode}/?`
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
    let date = new ExpireDate();
    date.dateInputMask(expirationDateInput);
  });
};

export { expireDateDOMListener };
