import './style.css';
import ExpireDate from '../../../src/core/classes/validation/ExpireDate.class';

document.addEventListener('DOMContentLoaded', () => {
  let expirationDateInput = document.getElementById('expiration-date');
  expirationDateInput.addEventListener('keyup', (event: Event) => {

    // @ts-ignore
    let value = event.target.value;
    if (value.length > 10) {
      event.preventDefault();
      return;
    }
    //@ts-ignore

    expirationDateInput.value = value.replace(/^([\d]{2})([\d]{2})$/, '$1/$2');
  });
  let date = new ExpireDate();
  // @ts-ignore
  date.dateInputMask(expirationDateInput);
});
