/**
 *  Visa checkout configuration class
 */
class VisaCheckout {
  private apiKey = 'ZG50YOGQQJ0PWPPX8D7F21ELpFID5NF-W256C638eL5hNgsOc';
  private encryptionKey = 'cX8SKE8k5X#BO40elD0M4dJV65WZGqCi1+I#S$rZ';
  private static _visaCheckoutButtonProps: any = {
    alt: 'Visa Checkout',
    class: 'v-button',
    role: 'button',
    url:
      'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };

  constructor() {
    window.addEventListener('DOMContentLoaded', () => {
      let body = document.getElementsByTagName('body')[0];
      body.appendChild(this.createVisaButton());
    });
  }

  private createVisaButton() {
    let button = document.createElement('img');
    button.setAttribute('url', VisaCheckout._visaCheckoutButtonProps.url);
    button.setAttribute('class', VisaCheckout._visaCheckoutButtonProps.class);
    button.setAttribute('role', VisaCheckout._visaCheckoutButtonProps.role);
    button.setAttribute('alt', VisaCheckout._visaCheckoutButtonProps.alt);
    return button;
  }

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
