declare const V: any;

/**
 *  Visa Checkout configuration class; sets up VC APM.
 *  The only data which merchant have to provide is apikey, rest of the configuration is setting automatically.
 */
class VisaCheckout {
  private static VISA_CHECKOUT_BUTTON_PROPS: any = {
    alt: 'Visa Checkout',
    className: 'v-button',
    role: 'button',
    src: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };
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
    const { alt, className, role, src } = VisaCheckout.VISA_CHECKOUT_BUTTON_PROPS;
    button.setAttribute('src', src);
    button.setAttribute('class', className);
    button.setAttribute('role', role);
    button.setAttribute('alt', alt);
    return button;
  }

  /**
   * Initialize Visa Checkout and sets handlers on every payment event.
   * 1. Adds Visa Checkout SDK.
   * 2. Attaches Visa Checkout button.
   * 3. Initialize payment configuration.
   * 4. Sets handlers on payment events.
   * @private
   */
  private _initVisaConfiguration() {
    const body = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');
    body.appendChild(script);
    script.addEventListener('load', () => {
      this._attachVisaButton();
      this._initPaymentConfiguration();
      this._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS);
      this._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.CANCEL);
      this._paymentStatusHandler(VisaCheckout.VISA_PAYMENT_STATUS.ERROR);
    });
    script.src = VisaCheckout.SDK_ADDRESS;
    return script;
  }

  /**
   * Attaches Visa Button to body element - optionally we can change this method to attach it somewhere else
   * @private
   */
  private _attachVisaButton() {
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(VisaCheckout._createVisaButton());
    return body;
  }

  /**
   * Handler used to simplify handling payment events; returns the JSON object with details of payment
   * @param event
   * @private
   */
  private _paymentStatusHandler(event: string) {
    V.on(event, (payment: object, error?: object) => {
      this.paymentStatus = event;
      this.paymentDetails = payment;
      this.paymentError = error ? error : {};
      // TODO: we have to decide how will show status message to customer, for now there is some silly alert.
      alert(`Status of payment: ${event}`);
      return { event, payment, error };
    });
  }

  /**
   * Init configuration (temporary with some test data).
   * apikey and encryptionKey will authenticate merchant.
   * Eventually in config, there'll be merchant credentials provided, now there are some test credentials.
   */
  private _initConfiguration = {
    apikey: '' as string,
    paymentRequest: {
      currencyCode: 'USD' as string,
      subtotal: '11.00' as string
    }
  };

  private _paymentStatus: string;
  private _paymentDetails: object;
  private _paymentError: object;

  set paymentDetails(value: object) {
    this._paymentDetails = value;
  }

  set paymentStatus(value: string) {
    this._paymentStatus = value;
  }

  set paymentError(value: object) {
    this._paymentError = value;
  }

  constructor(config: any) {
    const {
      props: { apikey }
    } = config;
    this._initConfiguration.apikey = apikey;
    this._initVisaConfiguration();
  }

  /**
   * Init configuration and payment data
   * @private
   */
  private _initPaymentConfiguration() {
    V.init(this._initConfiguration);
  }
}

export default VisaCheckout;
