import FormField from '../../core/shared/FormField';
import Selectors from '../../core/shared/Selectors';
import MessageBus from '../../core/shared/MessageBus';

/**
 * Definition of security code validation
 */
export default class SecurityCode extends FormField {
  private static INPUT_LENGTH: number = 3;
  private _messageBus: MessageBus;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT_SELECTOR, Selectors.SECURITY_CODE_MESSAGE_SELECTOR);

    this._messageBus = new MessageBus();

    this.setAttributes({
      maxlength: SecurityCode.INPUT_LENGTH,
      minlength: SecurityCode.INPUT_LENGTH
    });

    if (this._inputElement.value) {
      this.sendState();
    }
  }

  static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.SECURITY_CODE_INPUT_SELECTOR);
  }

  private sendState() {
    let formFieldState: FormFieldState = this.getState();
    let messageBusEvent: MessageBusEvent = {
      type: MessageBus.EVENTS.SECURITY_CODE_CHANGE,
      data: formFieldState
    };
    this._messageBus.publish(messageBusEvent);
  }

  onInput(event: Event) {
    super.onInput(event);
    this.sendState();
  }

  onBlur(event: FocusEvent) {
    super.onBlur(event);
    this.sendState();
  }

  onFocus(event: FocusEvent) {
    super.onFocus(event);
    this.sendState();
  }

  onPaste(event: ClipboardEvent) {
    super.onPaste(event);
    this.sendState();
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
