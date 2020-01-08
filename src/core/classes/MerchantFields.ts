import { IMessageBusValidateField } from '../models/Validation';
import MessageBus from '../shared/MessageBus';
import Validation from '../shared/Validation';

export class MerchantFields {
  private static readonly ADJACENT_HTML_PLACEMENT: InsertPosition = 'afterend';
  private static readonly CLEAR_VALUE: string = '';
  private static readonly DATA_ATTRIBUTE_NAME: string = 'data-st-name';
  private static readonly ERROR_LABEL_MARKUP: string = `<div class="error-label"></div>`;
  private static readonly KEYPRESS_EVENT: string = 'keypress';

  private _merchantInputs = document.getElementsByTagName('input') as HTMLCollection;
  private _messageBus: MessageBus;
  private _validation: Validation;

  constructor() {
    this._messageBus = new MessageBus();
    this._validation = new Validation();
  }

  public init(): void {
    this._findAllMerchantInputs();
  }

  private _findAllMerchantInputs(): { merchantFieldsNamesArray: string[] } {
    const merchantFieldsNamesArray = [];
    for (let i = 0; i < this._merchantInputs.length; ++i) {
      if (this._merchantInputs[i].hasAttribute(MerchantFields.DATA_ATTRIBUTE_NAME)) {
        const input = document.getElementById(this._merchantInputs[i].id) as HTMLInputElement;
        input.insertAdjacentHTML(MerchantFields.ADJACENT_HTML_PLACEMENT, MerchantFields.ERROR_LABEL_MARKUP);
        const messageContainer: HTMLElement = input.nextSibling as HTMLElement;
        this._backendValidation(input, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD, messageContainer);
        this._addKeypressListener(input);
        merchantFieldsNamesArray.push(this._merchantInputs[i].getAttribute(MerchantFields.DATA_ATTRIBUTE_NAME));
      }
    }
    return { merchantFieldsNamesArray };
  }

  private _addKeypressListener(input: HTMLInputElement): void {
    input.addEventListener(MerchantFields.KEYPRESS_EVENT, () => {
      input.setCustomValidity(MerchantFields.CLEAR_VALUE);
      Validation.removeClassFromClassList(input, Validation.ERROR_FIELD_CLASS);
      Validation.setMerchantInputErrorMessage(input);
    });
  }

  private _backendValidation(inputElement: HTMLInputElement, event: string, messageElement?: HTMLElement): void {
    this._messageBus.subscribe(event, (data: IMessageBusValidateField) => {
      this._validation.checkBackendValidity(data, inputElement, messageElement);
      this._validation.validate(inputElement, messageElement);
    });
  }
}
