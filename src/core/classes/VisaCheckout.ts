declare const V: any;
import { VISA_CHECKOUT_URLS } from './../imports/apms';
import { StJwt } from '../shared/StJwt';
import DomMethods from './../shared/DomMethods;
import Language from './../shared/Language';

/**
 *  Visa Checkout configuration class; sets up Visa e-wallet
 */
class VisaCheckout {
  private static VISA_PAYMENT_STATUS = {
    CANCEL: 'payment.cancel',
    ERROR: 'payment.error',
    SUCCESS: 'payment.success'
  };

  private static VISA_PAYMENT_RESPONSE_TYPES = {
    CANCEL: 'CANCEL',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
  };

  private _visaCheckoutButtonProps: any = {
    alt: 'Visa Checkout',
    className: 'v-button',
    role: 'button',
    src: VISA_CHECKOUT_URLS.DEV_BUTTON_URL
  };
  private _sdkAddress: string = VISA_CHECKOUT_URLS.DEV_SDK;
  private _paymentStatus: string;
  private _paymentDetails: object;
  private _livestatus: number = 0;
  private _placement: string = 'body';

  set paymentDetails(value: object) {
    this._paymentDetails = value;
  }

  set paymentStatus(value: string) {
    this._paymentStatus = value;
  }

  /**
   * Init configuration (temporary with some test data).
   * apikey and encryptionKey will authenticate merchant.
   * Eventually in config, there'll be merchant credentials provided, now there are some test credentials.
   */
  private _initConfiguration = {
    apikey: '' as string,
    paymentRequest: {
      currencyCode: '' as string,
      subtotal: '' as string
    }
  };

  constructor(config: any, jwt: string) {
    const {
      props: { apikey, livestatus, placement }
    } = config;
    const stJwt = new StJwt(jwt);
    this._livestatus = livestatus;
    this._placement = placement;
    this._initConfiguration.apikey = apikey;
    this._initConfiguration.paymentRequest.currencyCode = stJwt.currencyiso3a;
    this._initConfiguration.paymentRequest.subtotal = stJwt.mainamount;
    this._checkLiveStatus();
    this._initVisaConfiguration();
  }

  /**
   * Creates html image element which will be transformed into interactive button by SDK.
   */
  public _createVisaButton() {
    const button = document.createElement('img');
    const { alt, className, role, src } = this._visaCheckoutButtonProps;
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
    DomMethods.insertScript.call()
    const body = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');
    body.appendChild(script);
    script.addEventListener('load', () => {
      this._attachVisaButton();
      this._initPaymentConfiguration();
      this._paymentStatusHandler();
      this.getResponseMessage(this.paymentStatus);
    });
    script.src = this._sdkAddress;
    return script;
  }

  /**
   * Attaches Visa Button to specified element, if element is undefined Visa Checkout button is appended to body
   * @private
   */
  private _attachVisaButton() {
    const element = document.getElementById(this._placement)
      ? document.getElementById(this._placement)
      : document.getElementsByTagName('body')[0];
    element.appendChild(this._createVisaButton());
    return element;
  }

  /**
   * Checks if we are on production or not
   * @private
   */
  private _checkLiveStatus() {
    if (this._livestatus) {
      this._visaCheckoutButtonProps.src = VISA_CHECKOUT_URLS.PROD_BUTTON_URL;
      this._sdkAddress = VISA_CHECKOUT_URLS.PROD_SDK;
    }
  }

  private getResponseMessage(type: string) {
    let messageType;
    let content;
    if (type === VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS) {
      messageType = VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.SUCCESS;
      content = Language.translations.PAYMENT_SUCCESS;
    }
    if (type === VisaCheckout.VISA_PAYMENT_STATUS.ERROR) {
      messageType = VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.ERROR;
      content = Language.translations.PAYMENT_ERROR;
    }
    if (type === VisaCheckout.VISA_PAYMENT_STATUS.CANCEL) {
      messageType = VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.CANCEL;
      content = Language.translations.PAYMENT_CANCEL;
    }
    const notifictionFrame = document.getElementById('st-notification-frame-iframe') as HTMLIFrameElement;
    const notificationFramrContentWindow = notifictionFrame.contentWindow;
    notificationFramrContentWindow.postMessage(
      { type: messageType, content },
      'http://localhost:8080/notification-frame.html'
    );
  }

  /**
   * Handler used to simplify handling payment events; returns the JSON object with details of payment
   * @private
   */
  private _paymentStatusHandler() {
    V.on(VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS, (payment: object) => {
      this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
      this.paymentDetails = payment;
      this.getResponseMessage(this._paymentStatus);
    });
    V.on(VisaCheckout.VISA_PAYMENT_STATUS.ERROR, () => {
      this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
      this.getResponseMessage(this._paymentStatus);
    });

    V.on(VisaCheckout.VISA_PAYMENT_STATUS.CANCEL, () => {
      this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.CANCEL;
      this.getResponseMessage(this._paymentStatus);
    });
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
