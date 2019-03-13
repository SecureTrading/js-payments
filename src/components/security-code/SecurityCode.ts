import FormField from '../../core/shared/FormField';
import Selectors from '../../core/shared/Selectors';

/**
 * Definition of security code validation
 */
class SecurityCode extends FormField {
  private static INPUT_LENGTH: number = 3;

  constructor() {
    super(Selectors.SECURITY_CODE_INPUT_SELECTOR, Selectors.SECURITY_CODE_MESSAGE_SELECTOR);

    this.setAttributes({
      maxlength: SecurityCode.INPUT_LENGTH,
      minlength: SecurityCode.INPUT_LENGTH
    });
  }

  static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.SECURITY_CODE_INPUT_SELECTOR);
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

export default SecurityCode;
