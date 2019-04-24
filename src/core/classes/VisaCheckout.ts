declare const V: any;
import { environment } from '../../environments/environment';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import DomMethods from './../shared/DomMethods';
import Language from './../shared/Language';
import Payment from './../shared/Payment';

/**
 *  Visa Checkout configuration class; sets up Visa e-wallet
 */
class VisaCheckout {
  set paymentDetails(value: string) {
    this._paymentDetails = value;
  }

  get paymentStatus(): string {
    return this._paymentStatus;
  }

  set paymentStatus(value: string) {
    this._paymentStatus = value;
  }

  get responseMessage(): string {
    return this._responseMessage;
  }

  set responseMessage(value: string) {
    this._responseMessage = value;
  }

  private static VISA_PAYMENT_RESPONSE_TYPES = {
    CANCEL: 'payment.cancel',
    ERROR: 'payment.error',
    SUCCESS: 'payment.success'
  };

  private static VISA_PAYMENT_STATUS = {
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING'
  };

  private _visaCheckoutButtonProps: any = {
    alt: 'Visa Checkout',
    class: 'v-button',
    id: 'v-button',
    role: 'button',
    src: environment.VISA_CHECKOUT_URLS.DEV_BUTTON_URL
  };
  private _sdkAddress: string = environment.VISA_CHECKOUT_URLS.DEV_SDK;
  private _paymentStatus: string;
  private _paymentDetails: string;
  private _responseMessage: string;
  private _livestatus: number = 0;
  private _placement: string = 'body';
  private _buttonSettings: any;
  private _payment: Payment;
  private static WALLET_SOURCE: 'VISACHECKOUT';

  /**
   * Init configuration (temporary with some test data).
   * apikey and encryptionKey will authenticate merchant.
   * Eventually in config, there'll be merchant credentials provided, now there are some test credentials.
   */
  private _initConfiguration = {
    apikey: '' as string,
    paymentRequest: {
      currencyCode: '' as string,
      total: '' as string,
      subtotal: '' as string
    },
    settings: {}
  };

  constructor(config: any, jwt: string) {
    if (environment.testEnvironment) {
      this._attachVisaButton();
      this._setActionOnMockedButton();
    } else {
      const {
        props: { apikey, livestatus, placement, settings, paymentRequest, buttonSettings }
      } = config;
      const stJwt = new StJwt(jwt);
      this._payment = new Payment(jwt);
      this._livestatus = livestatus;
      this._placement = placement;
      this._setInitConfiguration(paymentRequest, settings, stJwt, apikey);
      this._buttonSettings = this.setConfiguration({ locale: stJwt.locale }, settings);
      this._setLiveStatus();
      this._initVisaFlow();
    }
  }

  public _setInitConfiguration(paymentRequest: any, settings: any, stJwt: StJwt, apikey: string) {
    this._initConfiguration.apikey = apikey;
    this._initConfiguration.paymentRequest = this._getInitPaymentRequest(paymentRequest, stJwt);
    this._initConfiguration.settings = this.setConfiguration({ locale: stJwt.locale }, settings);
  }

  public _getInitPaymentRequest(paymentRequest: any, stJwt: StJwt) {
    const config = this._initConfiguration.paymentRequest;
    config.currencyCode = stJwt.currencyiso3a;
    config.subtotal = stJwt.mainamount;
    config.total = stJwt.mainamount;
    return this.setConfiguration(config, paymentRequest);
  }

  private setConfiguration = (config: any, settings: any) => (settings || config ? { ...config, ...settings } : {});

  /**
   * Creates html image element which will be transformed into interactive button by SDK.
   */
  public _createVisaButton = () => DomMethods.setMultipleAttributes.apply(this, [this._visaCheckoutButtonProps, 'img']);

  /**
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  public setNotification(type: string, content: string) {
    DomMethods.getIframeContentWindow
      .call(this, Selectors.NOTIFICATION_FRAME_IFRAME)
      .postMessage({ type, content }, (window as any).frames[Selectors.NOTIFICATION_FRAME_IFRAME]);
  }

  /**
   * Sets action on appended mocked Visa Checkout button
   * @private
   */
  private _setActionOnMockedButton() {
    DomMethods.addListener(this._visaCheckoutButtonProps.id, 'click', () => {
      this._setMockedData().then(() => {
        this._proceedFlowWithMockedData();
      });
    });
  }

  /**
   * Retrieves data from mocked data endpoint
   * @private
   */
  private _setMockedData() {
    return fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        this.paymentDetails = data.payment;
        this.paymentStatus = data.status;
        return this.paymentDetails;
      });
  }

  /**
   * Proceeds payment flow with mocked data
   * @private
   */
  private _proceedFlowWithMockedData() {
    this.getResponseMessage(this.paymentStatus);
    this.setNotification(this.paymentStatus, this.responseMessage);
  }

  /**
   * Init configuration and payment data
   * @private
   */
  private _initPaymentConfiguration() {
    V.init(this._initConfiguration);
  }

  /**
   * Initialize Visa Checkout flow:
   * 1. Adds Visa Checkout SDK.
   * 2. Attaches Visa Checkout button.
   * 3. Initialize payment configuration.
   * 4. Sets handlers on payment events.
   * 5. Get response from Visa Checkout and sets notification
   * @private
   */
  private _initVisaFlow() {
    return DomMethods.insertScript('body', this._sdkAddress).addEventListener('load', () => {
      this._attachVisaButton();
      this._initPaymentConfiguration();
      this._paymentStatusHandler();
      this.getResponseMessage(this.paymentStatus);
    });
  }

  /**
   * Attaches Visa Button to specified element, if element is undefined Visa Checkout button is appended to body
   * @private
   */
  private _attachVisaButton = () => DomMethods.appendChildIntoDOM(this._placement, this._createVisaButton());

  /**
   * Checks if we are on production or not
   * @private
   */
  private _setLiveStatus() {
    if (this._livestatus) {
      this._visaCheckoutButtonProps.src = environment.VISA_CHECKOUT_URLS.PROD_BUTTON_URL;
      this._sdkAddress = environment.VISA_CHECKOUT_URLS.PROD_SDK;
    }
  }

  /**
   * Gets translated response message based on response communicate
   * @param type
   */
  private getResponseMessage(type: string) {
    switch (type) {
      case VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS: {
        this.responseMessage = Language.translations.PAYMENT_SUCCESS;
        break;
      }
      case VisaCheckout.VISA_PAYMENT_STATUS.WARNING: {
        this.responseMessage = Language.translations.PAYMENT_WARNING;
        break;
      }
      case VisaCheckout.VISA_PAYMENT_STATUS.ERROR: {
        this.responseMessage = Language.translations.PAYMENT_ERROR;
        break;
      }
    }
  }

  /**
   * Handles all of 3 types of responses from Visa Checkout:
   * - SUCCESS
   * - ERROR
   * - CANCEL
   * Then sets payment status and details (if payment succeeded), gets response message and sets notification.
   * @private
   */
  private _paymentStatusHandler() {
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.SUCCESS, (payment: object) => {
      this.paymentDetails = JSON.stringify(payment);
      this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
      this.getResponseMessage(this.paymentStatus);
      this._payment
        .authorizePayment({ walletsource: VisaCheckout.WALLET_SOURCE, wallettoken: this.paymentDetails })
        .then((response: object) => {
          return response;
        })
        .then((data: object) => {
          this.setNotification(MessageBus.EVENTS.NOTIFICATION_SUCCESS, this.responseMessage);
          return data;
        })
        .catch(() => {
          this.setNotification(MessageBus.EVENTS.NOTIFICATION_ERROR, this.responseMessage);
        });
    });
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.ERROR, () => {
      this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
      this.getResponseMessage(this.paymentStatus);
      this.setNotification(this.paymentStatus, this.responseMessage);
    });

    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.CANCEL, () => {
      this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.WARNING;
      this.getResponseMessage(this.paymentStatus);
      this.setNotification(this.paymentStatus, this.responseMessage);
    });
  }
}

export default VisaCheckout;
