import {
  appEndpoint,
  applyStylesToIframe,
  iframesEndpoints,
} from '../imports/iframe';

const { securityCode } = iframesEndpoints;

const securityCodeDOMListener = () => {
  document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById('st-security-code') as HTMLFormElement;
    let securityCodeInput = <HTMLInputElement>(
      document.getElementById('security-code')
    );
    applyStylesToIframe('security-code', `${securityCode}/?`);
    window.addEventListener(
      'message',
      event => {
        if (event.origin !== securityCode) {
          let isFormValid = Object.values(securityCodeInput.validity).some(
            item => item
          );
          if (isFormValid) {
            form.submit();
          } else {
            parent.postMessage(
              { isEmpty: securityCodeInput.validity.valueMissing },
              appEndpoint
            );
          }
        }
      },
      true
    );
  });
};

export { securityCodeDOMListener };
