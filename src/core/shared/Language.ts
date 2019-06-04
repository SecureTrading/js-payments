/**
 * Defines Language properties and methods and aggregate translations from all parts of library
 */

class Language {
  private static _translations = {
    APPLE_PAYMENT_IS_NOT_AVAILABLE: 'Payment is not available',
    APPLE_PAY_AMOUNT_AND_CURRENCY: 'Amount and currency are not set',
    APPLE_PAY_NOT_AVAILABLE: 'This version of browser does not support Apple Pay',
    APPLE_PAY_ONLY_ON_IOS: 'Your browser does not support Apple Pay',
    COMMUNICATION_ERROR_INVALID_REQUEST: 'Invalid request',
    COMMUNICATION_ERROR_INVALID_RESPONSE: 'Invalid response',
    COMMUNICATION_ERROR_TIMEOUT: 'Timeout',
    FORM_IS_NOT_VALID: 'Form is not valid',
    LABEL_CARD_NUMBER: 'Card number',
    LABEL_EXPIRATION_DATE: 'Expiration date',
    LABEL_SECURITY_CODE: 'Security code',
    MERCHANT_VALIDATION_FAILURE: 'Merchant validation failure',
    NOT_IMPLEMENTED_ERROR: 'Method not implemented',
    NO_CARDS_IN_WALLET: 'You have no cards in your wallet',
    PAY: 'Pay',
    PAYMENT_ERROR: 'An error occurred',
    PAYMENT_SUCCESS: 'Payment has been successfully processed',
    PAYMENT_WARNING: 'Payment has been cancelled',
    PROCESSING: 'Processing ...',
    VALIDATION_ERROR: 'Invalid field',
    VALIDATION_ERROR_CARD: 'Card number is invalid',
    VALIDATION_ERROR_CARD_AND_CODE: 'Security code does not match card number',
    VALIDATION_ERROR_FIELD_IS_EMPTY: 'Field is empty',
    VALIDATION_ERROR_FIELD_IS_REQUIRED: 'Field is required',
    VALIDATION_ERROR_PATTERN_MISMATCH: 'Value mismatch pattern',
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE: 'Payment type is not available',
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: 'Security code is too long',
    VALIDATION_ERROR_VALUE_TOO_SHORT: 'Value is too short'
  };
  static get translations(): {
    APPLE_PAY_ONLY_ON_IOS: string;
    APPLE_PAY_NOT_AVAILABLE: string;
    APPLE_PAYMENT_IS_NOT_AVAILABLE: string;
    APPLE_PAY_AMOUNT_AND_CURRENCY: string;
    COMMUNICATION_ERROR_INVALID_REQUEST: string;
    COMMUNICATION_ERROR_INVALID_RESPONSE: string;
    COMMUNICATION_ERROR_TIMEOUT: string;
    FORM_IS_NOT_VALID: string;
    LABEL_CARD_NUMBER: string;
    LABEL_EXPIRATION_DATE: string;
    LABEL_SECURITY_CODE: string;
    MERCHANT_VALIDATION_FAILURE: string;
    NOT_IMPLEMENTED_ERROR: string;
    NO_CARDS_IN_WALLET: string;
    PAY: string;
    PAYMENT_ERROR: string;
    PAYMENT_SUCCESS: string;
    PAYMENT_WARNING: string;
    PROCESSING: string;
    VALIDATION_ERROR: string;
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
