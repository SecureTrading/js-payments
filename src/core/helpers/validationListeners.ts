import { iframesEndpoints, appEndpoint } from '../imports/iframe';

const returnErrorMessage = (errors: any) => {
  console.log(errors);
  if (errors.isEmpty) {
    return 'Field is empty';
  }
};

const submitListener = () => {
  document.addEventListener('submit', event => {
    event.preventDefault();
    let cardNumberIframe = document.getElementById(
      'st-card-number'
    ) as HTMLIFrameElement;
    let securityCodeIframe = document.getElementById(
      'st-security-code'
    ) as HTMLIFrameElement;
    let expirationDateIframe = document.getElementById(
      'st-expiration-date'
    ) as HTMLIFrameElement;
    let cardNumberIframeContent = cardNumberIframe.contentWindow;
    let securityCodeIframeContent = securityCodeIframe.contentWindow;
    let expirationDateIframeContent = expirationDateIframe.contentWindow;
    cardNumberIframeContent.postMessage(
      'Post Card Number',
      iframesEndpoints.cardNumber
    );
    securityCodeIframeContent.postMessage(
      'Post Security Code',
      iframesEndpoints.securityCode
    );
    expirationDateIframeContent.postMessage(
      'Post expiration Date',
      iframesEndpoints.expirationDate
    );
  });

  window.addEventListener('message', event => {
    if (event.origin !== appEndpoint) {
      document.getElementById(
        'st-form__received-message'
      ).textContent = returnErrorMessage(event.data);
    }
  });
};

export { submitListener };
