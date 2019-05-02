import FormField from '../../core/shared/FormField';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';

/**
 * Definition of security code validation
 */
export default class SecurityCode extends FormField {
  public static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.SECURITY_CODE_INPUT);
  }
  private static INPUT_LENGTH: number = 3;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT, Selectors.SECURITY_CODE_MESSAGE);

    this.setAttributes({
      maxlength: SecurityCode.INPUT_LENGTH,
      minlength: SecurityCode.INPUT_LENGTH
    });

    if (this._inputElement.value) {
      this.sendState();
    }
  }

  protected onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  protected onBlur(event: FocusEvent) {
    super.onBlur(event);
    this.sendState();
  }

  protected onFocus(event: FocusEvent) {
    super.onFocus(event);
    this.sendState();
  }

  protected onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
  }

  private sendState() {
    const formFieldState: FormFieldState = this.getState();
    const messageBusEvent: IMessageBusEvent = {
      data: formFieldState,
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE
    };
    this._messageBus.publish(messageBusEvent);
  }
  // /**
  //  * Listens to postMessage event from Form
  //  * @deprecated
  //  */
  // private postMessageEventListener() {
  //   window.addEventListener(
  //     'message',
  //     () => {
  //       const cardNumber = localStorage.getItem('cardNumber');
  //       const securityCodeLength = Number(localStorage.getItem('securityCodeLength'));
  //       if (SecurityCode.setInputErrorMessage(this._fieldInstance, 'security-code-error')) {
  //         if (SecurityCode.cardNumberSecurityCodeMatch(cardNumber, securityCodeLength)) {
  //           localStorage.setItem('securityCode', this._fieldInstance.value);
  //         } else {
  //           SecurityCode.customErrorMessage(
  //             Language.translations.VALIDATION_ERROR_CARD_AND_CODE,
  //             'security-code-error'
  //           );
  //         }
  //       }
  //     },
  //     false
  //   );
  // }

  // /**
  //  * Matches Security Code with card number
  //  * @param cardNumber
  //  * @param securityCodeLength
  //  */
  // public static cardNumberSecurityCodeMatch(cardNumber: string, securityCodeLength: number) {
  //   const cardNumberLastChars = SecurityCode.getLastNChars(cardNumber, securityCodeLength);
  //   const securityCodeLengthRequired = localStorage.getItem('securityCode');
  //   return (
  //     securityCodeLengthRequired.length === securityCodeLength && cardNumberLastChars === securityCodeLengthRequired
  //   );
  // }
}
