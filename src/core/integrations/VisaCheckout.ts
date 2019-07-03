import { environment } from '../../environments/environment';
import { IWalletConfig } from '../models/Config';
import { INotificationEvent, NotificationType } from '../models/NotificationEvent';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import DomMethods from './../shared/DomMethods';
import Language from './../shared/Language';
import Payment from './../shared/Payment';

declare const V: any;

interface IVisaSettings {
  [key: string]: string;
}
interface IVisaConfig {
  [key: string]: string;
}

/**
 *  Visa Checkout configuration class; sets up Visa e-wallet
 */
export class VisaCheckout {
  get payment(): Payment {
    return this._payment;
  }

  set payment(value: Payment) {
    this._payment = value;
  }

  set paymentDetails(value: string) {
    this._paymentDetails = value;
  }

  get paymentDetails(): string {
    return this._paymentDetails;
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

  protected static VISA_PAYMENT_STATUS = {
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING'
  };

  private static VISA_PAYMENT_RESPONSE_TYPES = {
    CANCEL: 'payment.cancel',
    ERROR: 'payment.error',
    SUCCESS: 'payment.success'
  };

  public messageBus: MessageBus;

  protected _requestTypes: string[];
  protected _visaCheckoutButtonProps: any = {
    alt: 'Visa Checkout',
    class: 'v-button',
    id: 'v-button',
    role: 'button',
    src: environment.VISA_CHECKOUT_URLS.TEST_BUTTON_URL
  };

  private _sdkAddress: string = environment.VISA_CHECKOUT_URLS.TEST_SDK;
  private _paymentStatus: string;
  private _paymentDetails: string;
  private _responseMessage: string;
  private _livestatus: number = 0;
  private _placement: string = 'body';
  private _buttonSettings: any;
  private _payment: Payment;
  private _walletSource: string = 'VISACHECKOUT';
  private _notification: Notification;

  /**
   * Init configuration (temporary with some test data).
   * merchantId and encryptionKey will authenticate merchant.
   * Eventually in config, there'll be merchant credentials provided, now there are some test credentials.
   */
  private _initConfiguration = {
    apikey: '' as string,
    paymentRequest: {
      currencyCode: '' as string,
      subtotal: '' as string,
      total: '' as string
    },
    settings: {}
  };

  constructor(config: IWalletConfig, jwt: string, gatewayUrl: string) {
    this.messageBus = new MessageBus();
    this._notification = new Notification();
    const { merchantId, livestatus, placement, settings, paymentRequest, buttonSettings, requestTypes } = config;
    const stJwt = new StJwt(jwt);
    this.payment = new Payment(jwt, gatewayUrl);
    this._livestatus = livestatus;
    this._placement = placement;
    this._requestTypes = requestTypes;
    this._setInitConfiguration(paymentRequest, settings, stJwt, merchantId);
    this._buttonSettings = this.setConfiguration({ locale: stJwt.locale }, settings);
    this.customizeVisaButton(buttonSettings);
    this._setLiveStatus();
    this._initVisaFlow();
  }

  public _setInitConfiguration(paymentRequest: any, settings: any, stJwt: StJwt, merchantId: string) {
    this._initConfiguration.apikey = merchantId;
    this._initConfiguration.paymentRequest = this._getInitPaymentRequest(paymentRequest, stJwt) as any;
    this._initConfiguration.settings = this.setConfiguration({ locale: stJwt.locale }, settings);
  }

  /**
   * Adds query string to src visa button image to customize it
   * @param properties
   */
  public customizeVisaButton(properties: any) {
    const { color, size } = properties;
    const url = new URL(this._visaCheckoutButtonProps.src);
    if (color) {
      url.searchParams.append('color', color);
    }
    if (size) {
      url.searchParams.append('size', size);
    }
    this._visaCheckoutButtonProps.src = url.href;
    return this._visaCheckoutButtonProps.src;
  }

  public _getInitPaymentRequest(paymentRequest: any, stJwt: StJwt) {
    const config = this._initConfiguration.paymentRequest;
    config.currencyCode = stJwt.currencyiso3a;
    config.subtotal = stJwt.mainamount;
    config.total = stJwt.mainamount;
    return this.setConfiguration(config, paymentRequest);
  }

  /**
   * Creates html image element which will be transformed into interactive button by SDK.
   */
  public _createVisaButton = () => DomMethods.createHtmlElement.apply(this, [this._visaCheckoutButtonProps, 'img']);

  /**
   * Attaches Visa Button to specified element, if element is undefined Visa Checkout button is appended to body
   * @protected
   */
  protected _attachVisaButton = () => DomMethods.appendChildIntoDOM(this._placement, this._createVisaButton());

  /**
   * Gets translated response message based on response communicate
   * @param type
   */
  protected getResponseMessage(type: string) {
    switch (type) {
      case VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS: {
        this.responseMessage = Language.translations.PAYMENT_SUCCESS;
        break;
      }
      case VisaCheckout.VISA_PAYMENT_STATUS.WARNING: {
        this.responseMessage = Language.translations.PAYMENT_CANCELLED;
        break;
      }
      case VisaCheckout.VISA_PAYMENT_STATUS.ERROR: {
        this.responseMessage = Language.translations.PAYMENT_ERROR;
        break;
      }
    }
  }

  /**
   * Starts processing payment with request defined by merchant config
   */
  // @TODO STJS-205 refactor into Payments
  protected _processPayment() {
    return this.payment
      .processPayment(
        this._requestTypes,
        {
          walletsource: this._walletSource,
          wallettoken: this.paymentDetails
        },
        DomMethods.parseMerchantForm()
      )
      .then((result: any) => result.response)
      .then((data: object) => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
        this.getResponseMessage(this.paymentStatus);
        this._notification.success(this.responseMessage, true);
        return data;
      })
      .catch(() => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
        this.getResponseMessage(this.paymentStatus);
        this._notification.error(this.responseMessage, true);
      });
  }

  protected _onSuccess(payment: object) {
    this.paymentDetails = JSON.stringify(payment);
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
    this._processPayment();
  }

  protected _onError() {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
    this.getResponseMessage(this.paymentStatus);
    this._notification.error(this.responseMessage);
  }

  protected _onCancel() {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.WARNING;
    this.getResponseMessage(this.paymentStatus);
    this._notification.warning(this.responseMessage);
  }

  /**
   * Init configuration and payment data
   * @protected
   */
  protected _initPaymentConfiguration() {
    V.init(this._initConfiguration);
  }

  /**
   * Handles all of 3 types of responses from Visa Checkout:
   * - SUCCESS
   * - ERROR
   * - CANCEL
   * Then sets payment status and details (if payment succeeded), gets response message and sets notification.
   * @protected
   */
  protected _paymentStatusHandler() {
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.SUCCESS, (payment: object) => {
      this._onSuccess(payment);
    });
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.ERROR, () => {
      this._onError();
    });
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.CANCEL, () => {
      this._onCancel();
    });
  }

  private setConfiguration = (config: IVisaConfig, settings: IVisaSettings) =>
    settings || config ? { ...config, ...settings } : {};

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
    });
  }

  /**
   * Checks if we are processing live transactions or not
   * @private
   */
  private _setLiveStatus() {
    if (this._livestatus) {
      this._visaCheckoutButtonProps.src = environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL;
      this._sdkAddress = environment.VISA_CHECKOUT_URLS.LIVE_SDK;
    }
  }
}

export default VisaCheckout;
