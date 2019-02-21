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

/**
 * Listens to postMessage from iframe and returns proper error
 */
const returnedErrorMessageListener = () => {
  window.addEventListener('message', event => {
    const { origin, data } = event;
    const errorContainer = document.getElementById('st-form__received-message');
    if (origin !== appEndpoint) {
      errorContainer.textContent = returnErrorMessage(data);
    }
  });
};
/**
 * Listens to submit and gives iframes a sign that post has been done
 * @param id ID of iframe
 * @param url Target url of iframe
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
