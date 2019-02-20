import { appEndpoint } from '../imports/iframe';

const returnErrorMessage = (errors: any) => {
  if (errors.isEmpty) {
    return 'Field is empty';
  }
};

const submitListener = (id: string, url: string) => {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', event => {
      event.preventDefault();

      let singleIframe = document.getElementById(id) as HTMLIFrameElement;
      let iframeContentWindow = singleIframe.contentWindow;

      iframeContentWindow.postMessage('Post Card Number', url);
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
