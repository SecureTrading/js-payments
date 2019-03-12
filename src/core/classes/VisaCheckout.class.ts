declare const V: any;

/**
 *  Visa checkout configuration class
 */
class VisaCheckout {
  private static VISA_CHECKOUT_BUTTON_PROPS: any = {
    alt: 'Visa Checkout',
    className: 'v-button',
    role: 'button',
    src:
      'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };
  /**
   * Possible status of payment in VISA Checkout
   */
  private static VISA_PAYMENT_STATUS = {
    CANCEL: 'payment.cancel',
    ERROR: 'payment.error',
    SUCCESS: 'payment.success'
  };
  private static SDK_ADDRESS: string =
    'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js';

  /**
   * Creates html image element which will be transformed into interactive button by SDK.
   */
  public static _createVisaButton() {
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
   * Attach SDK from Visa Checkout as html markup (temporary unused due to malfunction with scripts)
   * @private
   */
  private _attachVisaSDK() {
    const body = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');
    body.appendChild(script);
    script.addEventListener('load', () => {
      this._setConfiguration();
    });
    script.src = VisaCheckout.SDK_ADDRESS;
  }

  /**
   * Attaches Visa Button to body element - optionally we can change this method to attach it somewhere else
   * @private
   */
  private static _attachVisaButton() {
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(VisaCheckout._createVisaButton());
  }

  /**
   * Simple handler used to simplify handling payment events; returns the JSON object with details of payment
   * @param event
   * @private
   */
  private static _paymentStatusHandler(event: string) {
    return event === VisaCheckout.VISA_PAYMENT_STATUS.ERROR
      ? V.on(event, (payment: object) => payment)
      : V.on(event, (payment: object, error: object) => ({ payment, error }));
  }

  public returnPaymentStatus() {}

  /**
   * Init configuration (temporary with some test data).
   * apikey and encryptionKey will authenticate merchant.
   * Eventually in config, there'll be merchant credentials provided, now there are some test credentials.
   */
  private _initConfiguration = {
    apikey: '' as string,
    encryptionKey: '' as string,
    paymentRequest: {
      currencyCode: 'USD' as string,
      subtotal: '11.00' as string
    }
  };

  constructor(config: any) {
    const {
      props: { apikey, encryptionKey }
    } = config;
    this._initConfiguration.apikey = apikey;
    this._initConfiguration.encryptionKey = encryptionKey;
    this._attachVisaSDK();
  }

  /**
   * Init configuration and payment data
   * @private
   */
  private _initPaymentConfiguration() {
    V.init(this._initConfiguration);
  }

  /**
   * Loads Visa Checkout configuration as soon as script is loaded and button attached to DOM
   */
  private _setConfiguration() {
    VisaCheckout._attachVisaButton();
    this._initPaymentConfiguration();
    VisaCheckout._paymentStatusHandler(
      VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS
    );
    VisaCheckout._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.CANCEL);
    VisaCheckout._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.ERROR);
  }
}

export default VisaCheckout;
