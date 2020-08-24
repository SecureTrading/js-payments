import { Container } from 'typedi';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Validation } from '../../application/core/shared/validation/Validation';
import { Frame } from '../../application/core/shared/frame/Frame';

export class MerchantFields {
  private static readonly ADJACENT_HTML_PLACEMENT: InsertPosition = 'afterend';
  private static readonly DATA_ATTRIBUTE_NAME: string = 'data-st-name';
  private static readonly ERROR_LABEL_MARKUP: string = `<div class="st-error-label"></div>`;
  private static readonly INPUT_MARKUP: string = 'input';
  private static readonly KEYPRESS_EVENT: string = 'keypress';

  private readonly _inputs: HTMLCollection;
  private _messageBus: MessageBus;
  private _validation: Validation;
  private _frame: Frame;

  constructor() {
    this._inputs = document.getElementsByTagName(MerchantFields.INPUT_MARKUP);
    this._messageBus = Container.get(MessageBus);
    this._frame = Container.get(Frame);
    this._validation = new Validation();
  }

  public init(): void {
    this._setMerchantFieldsProperties();
  }

  private _setMerchantFieldsProperties(): void {
    const { inputs } = this._getMerchantInputs();
    for (const item of inputs) {
      const { inputElement, messageElement } = Validation.returnInputAndErrorContainerPair(item);
      Validation.addErrorContainer(
        inputElement,
        MerchantFields.ADJACENT_HTML_PLACEMENT,
        MerchantFields.ERROR_LABEL_MARKUP
      );
      this._onKeyPress(inputElement);
      this._validation.backendValidation(inputElement, messageElement, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD);
    }
  }

  private _getMerchantInputs(): { inputs: HTMLInputElement[] } {
    return {
      inputs: Array.from(this._inputs).filter(item =>
        item.hasAttribute(MerchantFields.DATA_ATTRIBUTE_NAME)
      ) as HTMLInputElement[]
    };
  }

  private _onKeyPress(input: HTMLInputElement): void {
    input.addEventListener(MerchantFields.KEYPRESS_EVENT, () => {
      Validation.resetValidationProperties(input);
    });
  }
}
