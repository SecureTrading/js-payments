class Payment {
  private _payments: string[];
  private _availablePayments: string[];

  constructor(payments: string[]) {
    this._payments = payments;
    this._availablePayments = ['ApplePay', 'VisaCheckout'];
    this.isPaymentAvailable();
  }

  isPaymentAvailable() {
    this._payments.map(item => {
      if (!this._availablePayments.includes(item)) {
        alert(`${item} payment type is not available !`);
      }
    });
    // will return wheter indicated payment is available or not
  }
}

export default Payment;
