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
 * @param fieldId ID of field which is validated
 */
const inputValueListener = (fieldId: string) => {
  let input = <HTMLInputElement>document.getElementById(fieldId);
  window.addEventListener(
    'message',
    event => {
      if (
        event.origin !== cardNumber &&
        event.origin !== securityCode &&
        event.origin !== expirationDate
      ) {
        let isFormValid = input.validity.valid;
        if (isFormValid) {
          parent.postMessage(true, appEndpoint);
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
};

/**
 * Method aggregating applying styles and validating field
 * @param inputName
 * @param formId
 * @param fieldId
 * @param iframeId
 */
const inputListener = (
  inputName: string,
  formId: string,
  fieldId: string,
  iframeId: string
) => {
  document.addEventListener('DOMContentLoaded', () => {
    applyStylesToElement(iframeId, returnInputEndpoint(inputName));
    inputValueListener(fieldId);
  });
};

export { inputListener };
