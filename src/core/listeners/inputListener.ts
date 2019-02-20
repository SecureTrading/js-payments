import { appEndpoint, iframesEndpoints } from '../imports/iframe';
import { applyStylesToElement } from '../helpers/domHelpers';

const { cardNumber, securityCode, expirationDate } = iframesEndpoints;

const inputListener = (
  inputName: string,
  formId: string,
  fieldId: string,
  iframeId: string
) => {
  document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById(formId) as HTMLFormElement;
    let input = <HTMLInputElement>document.getElementById(fieldId);
    if (inputName === 'cardNumber') {
      applyStylesToElement(iframeId, `${cardNumber}/?`);
    } else if (inputName === 'securityCode') {
      applyStylesToElement(iframeId, `${securityCode}/?`);
    } else if (inputName === 'expirationDate') {
      applyStylesToElement(iframeId, `${expirationDate}/?`);
    }

    window.addEventListener(
      'message',
      event => {
        if (event.origin !== cardNumber) {
          let isFormValid = Object.values(input.validity).some(item => item);
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
