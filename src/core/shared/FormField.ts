import Formatter from './Formatter';
import Validation from './Validation';
import Frame from './Frame';


export default class FormField extends Frame {
  protected _inputSelector: string;
  protected _messageSelector: string;
  protected _inputElement: HTMLInputElement;
  protected _messageElement: HTMLParagraphElement;

  constructor(inputSelector: string, messageSelector: string) {

    super();
    // @ts-ignore
    this._inputElement = document.getElementById(inputSelector);
    // @ts-ignore
    this._messageElement = document.getElementById(messageSelector);
    this._inputSelector = inputSelector;
    this._messageSelector = messageSelector;
    this.setInputListeners();
    this.onInit();
  }

  protected _getAllowedStyles () {
    let allowed = super._getAllowedStyles();
    let input = "#"+this._inputSelector;
    let errorInput = input + ":invalid"
    let message = "#"+this._messageSelector;
    let label = "label[for=" + this._inputSelector + "]";
    allowed = { ...allowed,
                "font-size-input": [{property: "font-size", selector: input}],
                "font-size-label": [{property: "font-size", selector: label}],
                "font-size-message": [{property: "font-size", selector: message}],
                
                "line-height-input": [{property: "line-height", selector: input}],
                "line-height-label": [{property: "line-height", selector: label}],
                "line-height-message": [{property: "line-height", selector: message}],
                
                "color-input": [{property: "color",selector: input}],
                "color-label": [{property: "color", selector: label}],
                "color-input-error": [{property: "color", selector: errorInput}],
                "color-error": [{property: "color",selector: message}],
                           
                "background-color-input": [{property: "background-color",selector: input}],
                "background-color-input-error": [{property: "background-color",selector: errorInput}],

                "display-label": [{property: "display", selector: label}],
              }
    return allowed;
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

  protected getState(): FormFieldState {
    return {
      validity: this._inputElement.validity.valid,
      value: this._inputElement.value
    };
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
