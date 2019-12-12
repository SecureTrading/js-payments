import { IMessageBusValidateField } from '../models/Validation';
import MessageBus from '../shared/MessageBus';
import Validation from '../shared/Validation';

/**
 * Represents merchant fields which must be validated.
 */
export class MerchantFields {
  private static readonly DATA_ATTRIBUTE_NAME: string = 'data-st-name';
  private _merchantInputs = document.getElementsByTagName('input') as HTMLCollection;
  private _messageBus: MessageBus;
  private _validation: Validation;

  constructor() {
    this._messageBus = new MessageBus();
    this._validation = new Validation();
    this.findAllMerchantInputs();
  }

  /**
   * Checks if Merchant's form has inputs with data-st-name and  returns them.
   */
  public findAllMerchantInputs() {
    const merchantFieldsNamesArray = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this._merchantInputs.length; ++i) {
      if (this._merchantInputs[i].hasAttribute(MerchantFields.DATA_ATTRIBUTE_NAME)) {
        const input = document.getElementById(this._merchantInputs[i].id) as HTMLInputElement;
        input.insertAdjacentHTML('afterend', `<div class="error-label"></div>`);
        const messageContainer: HTMLElement = input.nextSibling as HTMLElement;
        this._backendValidation(input, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD, messageContainer);
        this._addKeypressListener(input);
        merchantFieldsNamesArray.push(this._merchantInputs[i].getAttribute(MerchantFields.DATA_ATTRIBUTE_NAME));
      }
    }
    return { merchantFieldsNamesArray };
  }

  /**
   * Sets keypress event on each validated field.
   * @param input
   * @private
   */
  private _addKeypressListener(input: HTMLInputElement) {
    input.addEventListener('keypress', () => {
      input.setCustomValidity('');
      input.classList.remove(Validation.ERROR_FIELD_CLASS);
      input.nextSibling.textContent = '';
    });
  }

  /**
   * Listens to backend validation event from MessageBus and sets proper validation actions.
   * @param inputElement
   * @param messageElement
   * @param event
   * @private
   */
  private _backendValidation(inputElement: HTMLInputElement, event: string, messageElement?: HTMLElement) {
    this._messageBus.subscribe(event, (data: IMessageBusValidateField) => {
      this._validation.setError(inputElement, messageElement, data);
      this._validation.validate(inputElement, messageElement);
    });
  }
}
