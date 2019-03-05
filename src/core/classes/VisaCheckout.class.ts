import V from './../imports/visaCheckout';

/**
 *  Visa checkout configuration class
 */
class VisaCheckout {
  private static API_KEY = 'ZG50YOGQQJ0PWPPX8D7F21ELpFID5NF-W256C638eL5hNgsOc';
  private static ENCRYPTION_KEY = 'cX8SKE8k5X#BO40elD0M4dJV65WZGqCi1+I#S$rZ';
  private static VISA_CHECKOUT_BUTTON_PROPS: any = {
    alt: 'Visa Checkout',
    className: 'v-button',
    role: 'button',
    src:
      'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };

  /**
   * Creates html image element which will be transformed into interactive button by SDK.
   */
  private static _createVisaButton() {
    const button = document.createElement('img');
    const {
      alt,
      className,
      role,
      src
    } = VisaCheckout.VISA_CHECKOUT_BUTTON_PROPS;
    button.setAttribute('src', src);
    button.setAttribute('class', className);
    button.setAttribute('role', role);
    button.setAttribute('alt', alt);
    return button;
  }

  /**
   * Attaches Visa Button to body element - optionally we can change this method to attach it somewhere else
   */
  private static _attachVisaButton() {
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(VisaCheckout._createVisaButton());
  }

  private static _paymentStatusHandler(event: string) {
    event === 'payment.error'
      ? V.on(event, (payment: object) => payment)
      : V.on(event, (payment: object, error: object) => ({ payment, error }));
  }

  private _initConfiguration: object = {
    apikey: VisaCheckout.API_KEY,
    encryptionKey: VisaCheckout.ENCRYPTION_KEY
  };

  constructor() {
    VisaCheckout._attachVisaButton();
    this._onVisaCheckoutReady();
  }

  /**
   * Loads Visa Checkout configuration as soon as script is loaded and button attached to DOM
   */
  private _onVisaCheckoutReady() {
    V.init(this._initConfiguration);
    VisaCheckout._paymentStatusHandler('payment.success');
    VisaCheckout._paymentStatusHandler('payment.cancel');
    VisaCheckout._paymentStatusHandler('payment.error');
  }
}

export default VisaCheckout;
