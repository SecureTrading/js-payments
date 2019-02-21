import { appEndpoint } from '../imports/iframe';

/**
 * Returns validation messages based on validity object
 * @param errors
 */
const returnErrorMessage = (errors: any) => {
  if (errors.isValid) {
    return 'Field is empty';
  }
};
const returnedErrorMessageListener = () => {
  window.addEventListener('message', event => {
    if (event.origin !== appEndpoint) {
      document.getElementById(
        'st-form__received-message'
      ).textContent = returnErrorMessage(event.data);
    }
  });
};
/**
 *
 * @param id
 * @param url
 */
const submitListener = (id: string, url: string) => {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', event => {
      event.preventDefault();

      let singleIframe = document.getElementById(id) as HTMLIFrameElement;
      let iframeContentWindow = singleIframe.contentWindow;

      iframeContentWindow.postMessage('Post Data', url);
    });
    returnedErrorMessageListener();
  });
};

export { submitListener };
