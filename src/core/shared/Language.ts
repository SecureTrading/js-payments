/**
 * Defines Language properties and methods and aggregate translations from all parts of library
 */

class Language {
  private static _translations = {
    APPLE_PAY_NOT_AVAILABLE: 'Apple pay is not available',
    COMMUNICATION_ERROR_INVALID_REQUEST: 'Invalid request',
    COMMUNICATION_ERROR_INVALID_RESPONSE: 'Invalid response',
    COMMUNICATION_ERROR_TIMEOUT: 'Timeout',
    PAYMENT_SUCCESS: 'Payment has been successfully proceeded',
    PAYMENT_ERROR: 'An error occurred',
    PAYMENT_WARNING: 'Payment has been canceled',
    VALIDATION_ERROR_CARD: 'Card number is invalid',
    VALIDATION_ERROR_CARD_AND_CODE: 'Security code does not match card number',
    VALIDATION_ERROR_FIELD_IS_EMPTY: 'Field is empty',
    VALIDATION_ERROR_FIELD_IS_REQUIRED: 'Field is required',
    VALIDATION_ERROR_PATTERN_MISMATCH: 'Value mismatch pattern',
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE: 'Payment type is not available !',
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: 'Security code is too long',
    VALIDATION_ERROR_VALUE_TOO_SHORT: 'Value is too short'
  };
  static get translations(): {
    APPLE_PAY_NOT_AVAILABLE: string;
    COMMUNICATION_ERROR_INVALID_REQUEST: string;
    COMMUNICATION_ERROR_INVALID_RESPONSE: string;
    COMMUNICATION_ERROR_TIMEOUT: string;
    PAYMENT_SUCCESS: string;
    PAYMENT_ERROR: string;
    PAYMENT_WARNING: string;
    VALIDATION_ERROR_CARD: string;
    VALIDATION_ERROR_CARD_AND_CODE: string;
    VALIDATION_ERROR_FIELD_IS_REQUIRED: string;
    VALIDATION_ERROR_FIELD_IS_EMPTY: string;
    VALIDATION_ERROR_PATTERN_MISMATCH: string;
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE: string;
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: string;
    VALIDATION_ERROR_VALUE_TOO_SHORT: string;
  } {
    return this._translations;
  }
}

export default Language;
