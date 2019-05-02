declare const V: any;
import { environment } from '../../environments/environment';
import { NotificationEvent, NotificationType } from '../models/NotificationEvent';
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

  public messageBus: MessageBus;

  protected _visaCheckoutButtonProps: any = {
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
  private _walletSource: string = 'VISACHECKOUT';

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

  constructor(config: any, jwt: string) {
    this.messageBus = new MessageBus();
    const {
      props: { merchantId, livestatus, placement, settings, paymentRequest, buttonSettings }
    } = config;
    const stJwt = new StJwt(jwt);
    this.payment = new Payment(jwt);
    this._livestatus = livestatus;
    this._placement = placement;
    this._setInitConfiguration(paymentRequest, settings, stJwt, merchantId);
    this._buttonSettings = this.setConfiguration({ locale: stJwt.locale }, settings);
    this._setLiveStatus();
    !environment.testEnvironment && this._initVisaFlow();
  }

  public _setInitConfiguration(paymentRequest: any, settings: any, stJwt: StJwt, merchantId: string) {
    this._initConfiguration.apikey = merchantId;
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
  public _createVisaButton = () => DomMethods.createHtmlElement.apply(this, [this._visaCheckoutButtonProps, 'img']);

  /**
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  public setNotification(type: string, content: string) {
    const notificationEvent: NotificationEvent = {
      content: content,
      type: type
    };
    const messageBusEvent: MessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.NOTIFICATION_FRAME_IFRAME);
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
  protected _attachVisaButton = () => DomMethods.appendChildIntoDOM(this._placement, this._createVisaButton());

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
  protected getResponseMessage(type: string) {
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
      let merchantFormData = DomMethods.parseForm(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
      this._payment
        .authorizePayment({ walletsource: this._walletSource, wallettoken: this.paymentDetails }, merchantFormData)
        .then((response: object) => {
          return response;
        })
        .then((data: object) => {
          this.setNotification(NotificationType.Success, this.responseMessage);
          return data;
        })
        .catch(() => {
          this.setNotification(NotificationType.Error, this.responseMessage);
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
