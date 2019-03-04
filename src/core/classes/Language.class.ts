/**
 * Defines Language properties and methods and aggregate translations from all parts of library
 */

class Language {
  private static _translations = {
    VALIDATION_ERROR_FIELD_IS_EMPTY: 'Field is empty',
    VALIDATION_ERROR_FIELD_IS_REQUIRED: 'Field is required',
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE: 'Payment type is not available !',
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: 'Security code is too long',
    VALIDATION_ERROR_VALUE_TOO_SHORT: 'Value is too short',
    VALIDATION_ERROR_PATTERN_MISMATCH: 'Value mismatch pattern',
    VALIDATION_ERROR_CARD_AND_CODE: 'Security code does not match card number',
    VALIDATION_ERROR_CARD: 'Card number is invalid'
  };
  static get translations(): {
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: string;
    VALIDATION_ERROR_VALUE_TOO_SHORT: string;
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE: string;
    VALIDATION_ERROR_FIELD_IS_REQUIRED: string;
    VALIDATION_ERROR_FIELD_IS_EMPTY: string;
    VALIDATION_ERROR_PATTERN_MISMATCH: string;
    VALIDATION_ERROR_CARD_AND_CODE: string;
    VALIDATION_ERROR_CARD: string;
  } {
    return this._translations;
  }
}

export default Language;
