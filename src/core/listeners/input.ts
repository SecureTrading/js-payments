import { appEndpoint, iframesEndpoints } from '../imports/iframe';
import { applyStylesToElement } from '../helpers/dom';

const { cardNumber, securityCode, expirationDate } = iframesEndpoints;

const inputListener = (inputName: string, formId: string, fieldId: string) => {
  document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById(formId) as HTMLFormElement;
    let input = <HTMLInputElement>document.getElementById(fieldId);
    if (inputName === 'cardNumber') {
      applyStylesToElement(fieldId, `${cardNumber}/?`);
    } else if (inputName === 'securityCode') {
      applyStylesToElement(fieldId, `${securityCode}/?`);
    } else if (inputName === 'expirationDate') {
      applyStylesToElement(fieldId, `${expirationDate}/?`);
    }

    window.addEventListener(
      'message',
      event => {
        if (event.origin !== cardNumber) {
          let isFormValid = Object.values(input.validity).some(item => item);
          console.log(input);
          if (isFormValid) {
            form.submit();
          } else {
            parent.postMessage(
              { isEmpty: input.validity.valueMissing },
              appEndpoint
            );
          }
        }
      },
      true
    );
  });
};

export { inputListener };
