/**
 * Defines Language properties and methods and aggregate translations from all parts of library
 */

class Language {
  private static _translations = {
    COMMUNICATION_ERROR_INVALID_REQUEST: 'Invalid request',
    COMMUNICATION_ERROR_INVALID_RESPONSE: 'Invalid response',
    COMMUNICATION_ERROR_TIMEOUT: 'Timeout',
    VALIDATION_ERROR_FIELD_IS_EMPTY: 'Field is empty',
    VALIDATION_ERROR_FIELD_IS_REQUIRED: 'Field is required',
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE:
      'payment type is not available !',
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: 'Security code is too long',
    VALIDATION_ERROR_SECURITY_CODE_TOO_SHORT: 'Security code is too short'
  };
  static get translations(): {
    COMMUNICATION_ERROR_INVALID_REQUEST: string;
    COMMUNICATION_ERROR_INVALID_RESPONSE: string;
    COMMUNICATION_ERROR_TIMEOUT: string;
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: string;
    VALIDATION_ERROR_SECURITY_CODE_TOO_SHORT: string;
    VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE: string;
    VALIDATION_ERROR_FIELD_IS_REQUIRED: string;
    VALIDATION_ERROR_FIELD_IS_EMPTY: string;
  } {
    return this._translations;
  }
}

export default Language;
