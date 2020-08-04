import { IFormFieldState } from '../../models/IFormFieldState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Language } from '../Language';
import { Selectors } from '../Selectors';
import { Translator } from '../Translator';
import { Utils } from '../Utils';
import { Validation } from '../Validation';
import { onInputWraper } from '../utils/onInputWrapper';
import { Frame } from '../frame/Frame';
import { MessageBus } from '../MessageBus';
import { Container } from 'typedi';

export class Input {
  protected static PLACEHOLDER_ATTRIBUTE: string = 'placeholder';
  public validation: Validation;
  protected _inputSelector: string;
  protected _labelSelector: string;
  protected _messageSelector: string;
  protected _inputElement: HTMLInputElement;
  protected _labelElement: HTMLLabelElement;
  protected _messageElement: HTMLDivElement;
  protected _cardNumberInput: HTMLInputElement;
  protected placeholder: string;
  private _translator: Translator;
  private _frame: Frame;
  private _messageBus: MessageBus;

  constructor(inputSelector: string, messageSelector: string, labelSelector: string) {
    this._messageBus = Container.get(MessageBus);
    this._frame = Container.get(Frame);
    this._cardNumberInput = document.getElementById(Selectors.CARD_NUMBER_INPUT) as HTMLInputElement;
    this._inputElement = document.getElementById(inputSelector) as HTMLInputElement;
    this._labelElement = document.getElementById(labelSelector) as HTMLLabelElement;
    this._messageElement = document.getElementById(messageSelector) as HTMLInputElement;
    this._inputSelector = inputSelector;
    this._labelSelector = labelSelector;
    this._messageSelector = messageSelector;
    this._setInputListeners();
    this.init();
  }

  public init(): void {
    this._translator = new Translator(this._frame.parseUrl().locale);
    this.validation = new Validation();

    this._setLabelText();
    this._addTabListener();
  }

  protected format(data: string) {
    this._inputElement.value = data;
  }

  protected getInputAllowedStyles(
    input: string,
    inputError: string,
    inputPlaceholder: string,
    message: string,
    label: string,
    icon?: string,
    wrapper?: string
  ) {
    return {
      'background-color-input': { property: 'background-color', selector: input },
      'background-color-input-error': {
        property: 'background-color',
        selector: inputError
      },
      'background-color-message': { property: 'background-color', selector: message },
      'background-color-label': { property: 'background-color', selector: label },
      'border-color-input': { property: 'border-color', selector: input },
      'border-color-input-error': { property: 'border-color', selector: inputError },
      'border-radius-input': { property: 'border-radius', selector: input },
      'border-radius-input-error': { property: 'border-radius', selector: inputError },
      'border-size-input': { property: 'border-width', selector: input },
      'border-size-input-error': { property: 'border-width', selector: inputError },
      'box-shadow-input': { property: 'box-shadow', selector: input },
      'color-error': { property: 'color', selector: message },
      'color-input': { property: 'color', selector: input },
      'color-input-error': { property: 'color', selector: inputError },
      'color-input-placeholder': { property: 'color', selector: inputPlaceholder },
      'color-label': { property: 'color', selector: label },
      'display-label': { property: 'display', selector: label },
      'font-size-input': { property: 'font-size', selector: input },
      'font-size-input-error': { property: 'font-size', selector: inputError },
      'font-size-label': { property: 'font-size', selector: label },
      'font-size-message': { property: 'font-size', selector: message },
      'font-family-input': { property: 'font-family', selector: input },
      'font-family-input-error': { property: 'font-family', selector: inputError },
      'font-family-label': { property: 'font-family', selector: label },
      'font-family-message': { property: 'font-family', selector: message },
      'line-height-input': { property: 'line-height', selector: input },
      'line-height-input-error': { property: 'line-height', selector: inputError },
      'line-height-label': { property: 'line-height', selector: label },
      'line-height-message': { property: 'line-height', selector: message },
      'max-width-label': { property: 'max-width', selector: label },
      'outline-input': { property: 'outline', selector: input },
      'space-inset-input': { property: 'padding', selector: input },
      'space-inset-input-error': { property: 'padding', selector: inputError },
      'space-inset-message': { property: 'padding', selector: message },
      'space-outset-input': { property: 'margin', selector: input },
      'space-outset-input-error': { property: 'margin', selector: inputError },
      'space-outset-message': { property: 'margin', selector: message },
      'position-top-icon': { property: 'top', selector: icon },
      'position-bottom-icon': { property: 'bottom', selector: icon },
      'position-right-icon': { property: 'right', selector: icon },
      'position-left-icon': { property: 'left', selector: icon },
      'position-top-label': { property: 'top', selector: label },
      'position-bottom-label': { property: 'bottom', selector: label },
      'position-right-label': { property: 'right', selector: label },
      'position-left-label': { property: 'left', selector: label },
      'width-label': { property: 'width', selector: label },
      'space-inset-wrapper': { property: 'padding', selector: wrapper }
    };
  }

  protected getAllowedStyles() {
    let allowed = this._frame.getAllowedStyles();
    allowed = {
      ...allowed,
      ...this.getInputAllowedStyles(
        `#${this._inputSelector}`,
        `#${this._inputSelector}.error-field`,
        `#${this._inputSelector}::placeholder`,
        `#${this._messageSelector}`,
        `label[for=${this._inputSelector}]`,
        `.st-card-number__wrapper #card-icon`,
        '.st-card-number__wrapper'
      )
    };
    return allowed;
  }

  protected getLabel(): string {
    throw new Error(Language.translations.NOT_IMPLEMENTED_ERROR);
  }

  protected getState(): IFormFieldState {
    return {
      validity: this._inputElement.validity.valid,
      value: this._inputElement.value
    };
  }

  protected onBlur() {
    this._blur();
    this.validation.validate(this._inputElement, this._messageElement);
  }

  protected onClick(event: Event) {
    this._click();
  }

  protected onFocus(event: Event) {
    this._focus();
  }

  protected onInput(event: Event) {
    this.validation.keepCursorsPosition(this._inputElement);
    Validation.setCustomValidationError('', this._inputElement);
    this.format(this._inputElement.value);
  }

  protected onKeyPress(event: KeyboardEvent) {
    if (Validation.isEnter(event)) {
      event.preventDefault();
      if (this._inputElement.id === Selectors.CARD_NUMBER_INPUT) {
        this.validation.luhnCheck(this._cardNumberInput, this._inputElement, this._messageElement);
      }
      this._validateInput();
      this.validation.callSubmitEvent();
    }
  }

  protected onKeydown(event: KeyboardEvent) {
    this.validation.setOnKeyDownProperties(this._inputElement, event);
  }

  protected onPaste(event: ClipboardEvent) {
    let { clipboardData } = event;
    event.preventDefault();
    if (this._inputElement === document.activeElement) {
      this.validation.keepCursorsPosition(this._inputElement);
    }
    if (typeof clipboardData === 'undefined') {
      // @ts-ignore
      clipboardData = window.clipboardData.getData('Text');
    } else {
      // @ts-ignore
      clipboardData = event.clipboardData.getData('text/plain');
    }

    // @ts-ignore
    this._inputElement.value = Utils.stripChars(clipboardData, undefined);
    Validation.setCustomValidationError('', this._inputElement);
    this.format(this._inputElement.value);
    this.validation.validate(this._inputElement, this._messageElement);
  }

  protected setAttributes(attributes: object) {
    // tslint:disable-next-line:forin
    for (const attribute in attributes) {
      // @ts-ignore
      this._inputElement.setAttribute(attribute, attributes[attribute]);
    }
  }

  protected setEventListener(event: string, validate: boolean = true) {
    this._messageBus.subscribe(event, () => {
      if (validate) {
        this._validateInput();
      }
    });
  }

  protected setValue(value: string) {
    this._inputElement.value = value;
  }

  protected setMessageBusEvent(event: string): IMessageBusEvent {
    const formFieldState: IFormFieldState = this.getState();
    return {
      data: formFieldState,
      type: event
    };
  }

  private _addTabListener() {
    window.addEventListener('focus', event => {
      this.onFocus(event);
    });
  }

  private _blur() {
    this._inputElement.blur();
  }

  private _click() {
    this._inputElement.click();
  }

  private _focus() {
    this._inputElement.focus();
  }

  private _setInputListeners() {
    this._inputElement.addEventListener('paste', (event: ClipboardEvent) => {
      this.onPaste(event);
    });

    this._inputElement.addEventListener('keypress', (event: KeyboardEvent) => {
      this.onKeyPress(event);
    });

    this._inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
      this.onKeydown(event);
    });

    this._inputElement.addEventListener(
      'input',
      onInputWraper((event: Event) => {
        this.onInput(event);
      })
    );

    this._inputElement.addEventListener('focus', (event: Event) => {
      this.onFocus(event);
    });

    this._inputElement.addEventListener('blur', () => {
      this.onBlur();
    });

    this._inputElement.addEventListener('click', (event: Event) => {
      this.onClick(event);
    });
  }

  private _setLabelText() {
    this._labelElement.textContent = this._translator.translate(this.getLabel());
  }

  private _validateInput() {
    this.format(this._inputElement.value);
    if (this._inputElement.id === Selectors.CARD_NUMBER_INPUT) {
      this.validation.luhnCheck(this._cardNumberInput, this._inputElement, this._messageElement);
    }
    this.validation.validate(this._inputElement, this._messageElement);
  }
}
