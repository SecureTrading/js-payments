/**
 * Defines Language properties and methods and aggregate translations from all parts of library
 */

class Language {
  private static _translations = {
    VALIDATION_ERROR_SECURITY_CODE_TOO_SHORT: 'Security code is too short',
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: 'Security code is too long'
  };

  constructor() {}

  static get translations(): {
    VALIDATION_ERROR_SECURITY_CODE_TOO_LONG: string;
    VALIDATION_ERROR_SECURITY_CODE_TOO_SHORT: string;
  } {
    return this._translations;
  }
}

export default Language;
