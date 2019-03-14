import Formatter from './Formatter';
import Validation from './Validation';

export default class FormField {
  protected _inputElement: HTMLInputElement;
  protected _messageElement: HTMLParagraphElement;

  constructor(inputSelector: string, messageSelector: string) {
    // @ts-ignore
    this._inputElement = document.getElementById(inputSelector);
    // @ts-ignore
    this._messageElement = document.getElementById(messageSelector);
    this.setInputListeners();
  }

  private setInputListeners() {
    this._inputElement.addEventListener('paste', (event: ClipboardEvent) => {
      this.onPaste(event);
    });

    this._inputElement.addEventListener('keypress', (event: KeyboardEvent) => {
      this.onKeyPress(event);
    });

    this._inputElement.addEventListener('input', (event: Event) => {
      this.onInput(event);
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (!Validation.isCharNumber(event)) {
      event.preventDefault();
    }
  }

  onInput(event: Event) {
    this.format(this._inputElement.value);
    this.validate();
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData: string;

    event.preventDefault();

    clipboardData = event.clipboardData.getData('text/plain');
    this._inputElement.value = Formatter.trimNonNumeric(clipboardData);
    this.validate();
  }

  setAttributes(attributes: object) {
    for (let attribute in attributes) {
      // @ts-ignore
      this._inputElement.setAttribute(attribute, attributes[attribute]);
    }
  }

  /**
   * Method placed errorMessage inside chosen container (specified by id).
   * @param messageText
   */
  setMessage(messageText: string) {
    this._messageElement.innerText = messageText;
  }

  setValue(value: string) {
    this._inputElement.value = value;
  }

  validate() {
    let validationMessage: string = Validation.getValidationMessage(this._inputElement.validity);
    this.setMessage(validationMessage);
  }

  format(data: string) {
    this._inputElement.value = data;
  }
}
