import { availablePayments } from '../imports/payments';

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

  // will return wheter indicated payment is available or not
  arePaymentsAvailable() {
    this._payments.map(item => {
      if (!this._availablePayments.includes(item)) {
        console.error(`${item} payment type is not available !`);
        return false;
      }
      return true;
    });
  }

  // load script / payment library url,
  // load initial config with  user key supported
  setAvailablePayments() {}
}

export default Payment;
