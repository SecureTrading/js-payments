declare const V: any;
import { environment } from '../../environments/environment';
import { INotificationEvent, NotificationType } from '../models/NotificationEvent';
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

  protected _step: boolean;
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

  constructor(config: any, step: boolean, jwt: string) {
    this.messageBus = new MessageBus();
    const {
      props: { merchantId, livestatus, placement, settings, paymentRequest, buttonSettings }
    } = config;
    const stJwt = new StJwt(jwt);
    this.payment = new Payment(jwt);
    this._livestatus = livestatus;
    this._placement = placement;
    this._step = step;
    this._setInitConfiguration(paymentRequest, settings, stJwt, merchantId);
    this._buttonSettings = this.setConfiguration({ locale: stJwt.locale }, settings);
    this.customizeVisaButton(buttonSettings);
    this._setLiveStatus();
    if (!environment.testEnvironment) {
      this._initVisaFlow();
    }
  }

  public _setInitConfiguration(paymentRequest: any, settings: any, stJwt: StJwt, merchantId: string) {
    this._initConfiguration.apikey = merchantId;
    this._initConfiguration.paymentRequest = this._getInitPaymentRequest(paymentRequest, stJwt);
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
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  public setNotification(type: string, content: string) {
    const notificationEvent: INotificationEvent = {
      content,
      type
    };
    const messageBusEvent: IMessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.NOTIFICATION_FRAME_IFRAME);
  }

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
   * Starts processing payment with AUTH pr CACHETOKENISE request
   */
  protected _processPayment() {
    this.payment
      .processPayment(
        { requesttypedescription: this._step ? 'CACHETOKENISE' : 'AUTH' },
        {
          walletsource: this._walletSource,
          wallettoken: this.paymentDetails
        },
        DomMethods.parseMerchantForm()
      )
      .then((response: object) => response)
      .then((data: object) => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
        this.getResponseMessage(this.paymentStatus);
        this.setNotification(NotificationType.Success, this.responseMessage);
        return data;
      })
      .catch(() => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
        this.getResponseMessage(this.paymentStatus);
        this.setNotification(NotificationType.Error, this.responseMessage);
      });
  }

  private setConfiguration = (config: any, settings: any) => (settings || config ? { ...config, ...settings } : {});

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
   * Checks if we are processing live transactions or not
   * @private
   */
  private _setLiveStatus() {
    if (this._livestatus) {
      this._visaCheckoutButtonProps.src = environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL;
      this._sdkAddress = environment.VISA_CHECKOUT_URLS.LIVE_SDK;
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
      this._processPayment();
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
