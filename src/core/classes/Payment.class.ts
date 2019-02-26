import { availablePayments } from '../imports/payments';
import Language from './Language.class';

/***
 * Class for Payment types definitions.
 * Defines APM's
 */

class Payment {
  private _payments: string[];
  private _codes: string[];
  private _availablePayments: string[];

  constructor(payments: string[], codes: string[]) {
    this._payments = payments;
    this._codes = codes;
    this._availablePayments = [...availablePayments];
    this.arePaymentsAvailable();
  }

  /***
   * Checks if inficated by client payments are available for him.
   */
  public arePaymentsAvailable() {
    this._payments.map(item => {
      if (!this._availablePayments.includes(item)) {
        console.error(
          `${item} ${
            Language.translations.VALIDATION_ERROR_PAYMENT_IS_NOT_AVAILABLE
          }`
        );
        return false;
      }
      return true;
    });
  }
}

export default Payment;
