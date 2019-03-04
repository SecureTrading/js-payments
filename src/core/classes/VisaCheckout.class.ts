class VisaCheckout {
  private static _visaCheckoutButtonURL: string =
    'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png';
  private static _visaCheckoutButtonProps: object = {
    alt: 'Visa Checkout',
    class: 'v-button',
    role: 'button'
  };

  constructor() {}

  private _onVisaCheckoutReady() {
    V.init({
      apikey: 'ZG50YOGQQJ0PWPPX8D7F21ELpFID5NF-W256C638eL5hNgsOc',
      encryptionKey: 'cX8SKE8k5X#BO40elD0M4dJV65WZGqCi1+I#S$rZ',
      paymentRequest: {
        currencyCode: 'USD',
        subtotal: '11.00'
      }
    });
  }

  private _onPaymentSuccess() {
    V.on('payment.success', function(payment: object) {
      alert(JSON.stringify(payment));
    });
  }

  private _onPaymentCancel() {
    V.on('payment.cancel', function(payment: object) {
      alert(JSON.stringify(payment));
    });
  }

  private _onPaymentError() {
    V.on('payment.error', function(payment: object, error: object) {
      alert(JSON.stringify(error));
    });
  }
}

export default VisaCheckout;
