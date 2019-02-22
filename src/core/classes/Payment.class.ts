import { availablePayments } from '../imports/payments';

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
        console.error(`${item} payment type is not available !`);
        return false;
      }
      return true;
    });
  }
}

export default Payment;
