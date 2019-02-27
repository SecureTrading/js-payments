import Language from '../classes/Language.class';
import { appEndpoint, iframesEndpoints } from '../imports/iframe';
import { applyStylesToElement } from '../helpers/dom';

const { cardNumber, securityCode, expirationDate } = iframesEndpoints;

/**
 * Method returns specific endpoint for each input
 * @param inputName
 */
const returnInputEndpoint = (inputName: string) => {
  if (inputName === 'cardNumber') {
    return `${cardNumber}/?`;
  } else if (inputName === 'securityCode') {
    return `${securityCode}/?`;
  } else if (inputName === 'expirationDate') {
    return `${expirationDate}/?`;
  }
};

/**
 * Method for checking validity object and sending response to parent node
 * @param fieldInstance Instance of field which is validated
 */
const submitFormListener = (fieldInstance: HTMLInputElement) => {
  const errorContainer = document.getElementById(
    'received-message'
  ) as HTMLElement;
  window.addEventListener(
    'message',
    event => {
      if (
        event.origin !== cardNumber &&
        event.origin !== securityCode &&
        event.origin !== expirationDate
      ) {
        const isFormValid = fieldInstance.validity.valid;
        if (isFormValid) {
          parent.postMessage(true, appEndpoint);
          errorContainer.innerText = '';
        } else {
          errorContainer.innerText =
            Language.translations.VALIDATION_ERROR_FIELD_IS_REQUIRED;
        }
      }
    },
    true
  );
};
