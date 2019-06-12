import Formatter from '../../core/shared/Formatter';
import FormField from '../../core/shared/FormField';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

/**
 * Defines specific Expiration Date validation methods and attributes
 */
export default class ExpirationDate extends FormField {
  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Selectors.EXPIRATION_DATE_INPUT) as HTMLInputElement;
  private static DISABLE_FIELD_CLASS = 'st-input--disabled';
  private static DISABLE_STATE = 'disabled';
  private static EXPIRATION_DATE_LENGTH: number = 5;
  private static INPUT_PATTERN: string = '^(0[1-9]|1[0-2])\\/([0-9]{2})$';

  constructor() {
    super(Selectors.EXPIRATION_DATE_INPUT, Selectors.EXPIRATION_DATE_MESSAGE, Selectors.EXPIRATION_DATE_LABEL);

    this.setAttributes({ pattern: ExpirationDate.INPUT_PATTERN });

    if (this._inputElement.value) {
      this.sendState();
    }
    this.setFocusListener();
    this.setDisableListener();
    this.validation.backendValidation(
      this._inputElement,
      this._messageElement,
      MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
    );
  }

  /**
   * Gets translated label content.
   */
  public getLabel(): string {
    return Language.translations.LABEL_EXPIRATION_DATE;
  }

  /**
   *
   */
  public setFocusListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, () => {
      this.format(this._inputElement.value);
      this.validation.validate(this._inputElement, this._messageElement);
    });
  }

  /**
   * Listens to BLOCK_EXPIRATION_DATE event and toggle disable attribute and class.
   */
  public setDisableListener() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_EXPIRATION_DATE, (state: boolean) => {
      if (state) {
        this._inputElement.setAttribute(ExpirationDate.DISABLE_STATE, 'true');
        this._inputElement.classList.add(ExpirationDate.DISABLE_FIELD_CLASS);
      } else {
        this._inputElement.removeAttribute(ExpirationDate.DISABLE_STATE);
        this._inputElement.classList.remove(ExpirationDate.DISABLE_FIELD_CLASS);
      }
    });
  }

  /**
   * Extends onInput method and adds masking and formatting.
   * @param event
   */
  protected onInput(event: Event) {
    super.onInput(event);
    this._inputElement.value = Formatter.trimNonNumericExceptSlash(this._inputElement.value);
    if (this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH) {
      this._inputElement.value = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
      this.validation.validate(this._inputElement, this._messageElement);
    }
    this.sendState();
  }

  /**
   * Extends onFocus method.
   * @param event
   */
  protected onFocus(event: Event) {
    super.onFocus(event);
  }

  /**
   * Extends onBlur method and triggers sendState().
   */
  protected onBlur() {
    super.onBlur();
    this.sendState();
  }

  /**
   * Extends onPaste method with formatting and masking.
   * @param event
   */
  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    const preparedValue = this._inputElement.value.substring(0, ExpirationDate.EXPIRATION_DATE_LENGTH);
    this._inputElement.value = Formatter.maskExpirationDateOnPaste(preparedValue);
    this.sendState();
  }

  /**
   * Extends onKeyPress event with max length check.
   * @param event
   */
  protected onKeyPress(event: KeyboardEvent) {
    super.onKeyPress(event);
    if (this.isMaxLengthReached()) {
      event.preventDefault();
    }
  }

  /**
   * Formats indicated date using mask.
   * @param date
   */
  protected format(date: string) {
    this.setValue(Formatter.maskExpirationDate(date));
  }

  /**
   * Checked if indicated value length is greater that expected.
   */
  private isMaxLengthReached = (): boolean => this._inputElement.value.length >= ExpirationDate.EXPIRATION_DATE_LENGTH;

  /**
   * Propagates expiration date change to MessageBus
   */
  private sendState() {
    const formFieldState: IFormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_EXPIRATION_DATE
    };
    this._messageBus.publish(messageBusEvent);
  }
}
