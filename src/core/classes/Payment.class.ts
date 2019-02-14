class Payment {
  private _payments: string[];
  private _codes: string[];
  private _availablePayments: string[];

  constructor(payments: string[], codes: string[]) {
    this._payments = payments;
    this._codes = codes;
    this._availablePayments = ['ApplePay', 'VisaCheckout'];
    this.arePaymentsAvailable();
  }

  arePaymentsAvailable() {
    this._payments.map(item => {
      if (!this._availablePayments.includes(item)) {
        alert(`${item} payment type is not available !`);
      }
    });
    // will return wheter indicated payment is available or not
  }

  setAvailablePayments() {
    // load script / payment library url,
    // load initial config with  user key supported
  }
}

export default Payment;
