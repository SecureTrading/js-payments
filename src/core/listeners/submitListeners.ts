import { iframesEndpoints, appEndpoint } from '../imports/iframe';

const returnErrorMessage = (errors: any) => {
  console.log(errors);
  if (errors.isEmpty) {
    return 'Field is empty';
  }
};

const submitListener = (iframeId: string) => {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', event => {
      event.preventDefault();
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      let iframeContentWindow = iframe.contentWindow;

      iframeContentWindow.postMessage(
        'Post Card Number',
        iframesEndpoints.cardNumber
      );
    });

    window.addEventListener('message', event => {
      if (event.origin !== appEndpoint) {
        document.getElementById(
          'st-form__received-message'
        ).textContent = returnErrorMessage(event.data);
      }
    });
  });
};

export { submitListener };
