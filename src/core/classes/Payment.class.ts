class Payment {
  private _payments: string[];
  private _availablePayments: string[];

  constructor(payments: string[]) {
    this._payments = payments;
  }

  isPaymentAvailable() {
    this._payments.map(item => {
      if (!this._availablePayments.includes(item)) {
        console.log(`${item} payment type is not available !`);
      }
    });
    // will return wheter indicated payment is available or not
  }
}

export default Payment;
