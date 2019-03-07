const V = (window as any).V;

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
  private static SDK_ADDRESS: string =
    'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js';

  /**
   * Possible status of payment in VISA Checkout
   */
  private static VISA_PAYMENT_STATUS = {
    CANCEL: 'payment.cancel',
    ERROR: 'payment.error',
    SUCCESS: 'payment.success'
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
   * Attach SDK from Visa Checkout as html markup (temporary unused due to malfunction with scripts)
   * TODO: Change attaching script via markup to this function
   * @private
   */
  private static _attachVisaSDK() {
    const script = document.createElement('script');
    script.src = VisaCheckout.SDK_ADDRESS;
    document.head.appendChild(script);
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
    event === VisaCheckout.VISA_PAYMENT_STATUS.ERROR
      ? V.on(event, (payment: object) => payment)
      : V.on(event, (payment: object, error: object) => ({ payment, error }));
  }

  /**
   * Init configuration (temporary with some test data)
   */
  private _initConfiguration = {
    apikey: '' as string,
    encryptionKey: '' as string
  };

  constructor(config: {}) {
    const {
      // @ts-ignore
      props: { apikey, encryptionKey }
    } = config;
    this._initConfiguration.apikey = apikey;
    this._initConfiguration.encryptionKey = encryptionKey;
    this._setConfiguration();
  }

  /**
   * Loads Visa Checkout configuration as soon as script is loaded and button attached to DOM
   */
  private _setConfiguration() {
    VisaCheckout._attachVisaButton();
    V.init(this._initConfiguration);
    VisaCheckout._paymentStatusHandler(
      VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS
    );
    VisaCheckout._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.CANCEL);
    VisaCheckout._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.ERROR);
  }
}

export default VisaCheckout;
