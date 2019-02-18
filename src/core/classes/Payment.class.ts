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

  arePaymentsAvailable() {
    this._payments.map(item => {
      if (!this._availablePayments.includes(item)) {
        console.error(`${item} payment type is not available !`);
        return false;
      }
      return true;
    });
  }

  setAvailablePayments() {}
}

export default Payment;
