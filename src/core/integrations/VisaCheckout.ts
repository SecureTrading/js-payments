import { environment } from '../../environments/environment';
import { IWalletConfig } from '../models/Config';
import { IVisaConfig, IVisaSettings } from '../models/VisaCheckout';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import { StJwt } from '../shared/StJwt';
import DomMethods from './../shared/DomMethods';
import Language from './../shared/Language';
import Payment from './../shared/Payment';
import { GoogleAnalytics } from './GoogleAnalytics';

declare const V: any;

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

  protected requestTypes: string[];
  protected visaCheckoutButtonProps: any = {
    alt: 'Visa Checkout',
    class: 'v-button',
    id: 'v-button',
    role: 'button',
    src: environment.VISA_CHECKOUT_URLS.TEST_BUTTON_URL
  };

  private _buttonSettings: any;
  private _messageBus: MessageBus;
  private _payment: Payment;
  private _paymentDetails: string;
  private _paymentStatus: string;
  private _responseMessage: string;
  private _sdkAddress: string = environment.VISA_CHECKOUT_URLS.TEST_SDK;
  private _walletSource: string = 'VISACHECKOUT';
  private _notification: Notification;
  private _stJwt: StJwt;
  private _livestatus: number = 0;
  private _placement: string = 'body';

  private _initConfiguration = {
    apikey: '' as string,
    paymentRequest: {
      currencyCode: '' as string,
      subtotal: '' as string,
      total: '' as string
    },
    settings: {}
  };

  constructor(config: IWalletConfig, jwt: string, gatewayUrl: string, livestatus?: number) {
    this._messageBus = new MessageBus();
    this._notification = new Notification();
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['AUTH'];
    this._stJwt = new StJwt(jwt);
    this._livestatus = livestatus;
    this._configurePaymentProcess(jwt, config, gatewayUrl);
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { newJwt } = data;
      this._configurePaymentProcess(newJwt, config, gatewayUrl);
    });
  }

  public setInitConfiguration(paymentRequest: any, settings: any, stJwt: StJwt, merchantId: string) {
    this._initConfiguration.apikey = merchantId;
    this._initConfiguration.paymentRequest = this.getInitPaymentRequest(paymentRequest, stJwt) as any;
    this._initConfiguration.settings = this._setConfiguration({ locale: stJwt.locale }, settings);
  }

  public customizeVisaButton(properties: any) {
    const { color, size } = properties;
    const url = new URL(this.visaCheckoutButtonProps.src);
    if (color) {
      url.searchParams.append('color', color);
    }
    if (size) {
      url.searchParams.append('size', size);
    }
    this.visaCheckoutButtonProps.src = url.href;
    return this.visaCheckoutButtonProps.src;
  }

  public getInitPaymentRequest(paymentRequest: any, stJwt: StJwt) {
    const config = this._initConfiguration.paymentRequest;
    config.currencyCode = stJwt.currencyiso3a;
    config.subtotal = stJwt.mainamount;
    config.total = stJwt.mainamount;
    return this._setConfiguration(config, paymentRequest);
  }

  public createVisaButton = () => DomMethods.createHtmlElement.apply(this, [this.visaCheckoutButtonProps, 'img']);

  protected attachVisaButton = () => DomMethods.appendChildIntoDOM(this._placement, this.createVisaButton());

  protected onSuccess(payment: object) {
    this.paymentDetails = JSON.stringify(payment);
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
    this.payment
      .processPayment(
        this.requestTypes,
        {
          walletsource: this._walletSource,
          wallettoken: this.paymentDetails
        },
        DomMethods.parseMerchantForm()
      )
      .then(() => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
        this._getResponseMessage(this.paymentStatus);
        this._notification.success(this.responseMessage, true);
        GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
      })
      .catch((error: any) => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
        this._getResponseMessage(this.paymentStatus);
        this._notification.error(this.responseMessage, true);
      });
  }

  protected onError() {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
    this._getResponseMessage(this.paymentStatus);
    this._notification.error(this.responseMessage, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  protected onCancel() {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.WARNING;
    this._getResponseMessage(this.paymentStatus);
    this._notification.warning(this.responseMessage, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment canceled');
  }

  protected initPaymentConfiguration() {
    V.init(this._initConfiguration);
  }

  protected paymentStatusHandler() {
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.SUCCESS, (payment: object) => {
      this.onSuccess(payment);
    });
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.ERROR, () => {
      this.onError();
    });
    V.on(VisaCheckout.VISA_PAYMENT_RESPONSE_TYPES.CANCEL, () => {
      this.onCancel();
    });
  }

  private _configurePaymentProcess(jwt: string, config: IWalletConfig, gatewayUrl: string) {
    const { merchantId, livestatus, placement, settings, paymentRequest, buttonSettings, requestTypes } = config;
    this._stJwt = new StJwt(jwt);
    this.payment = new Payment(jwt, gatewayUrl);
    this._livestatus = livestatus;
    this._placement = placement;
    this.requestTypes = requestTypes;
    this.setInitConfiguration(paymentRequest, settings, this._stJwt, merchantId);
    this._buttonSettings = this._setConfiguration({ locale: this._stJwt.locale }, settings);
    this.customizeVisaButton(buttonSettings);
    this._setLiveStatus();
    DomMethods.removeAllChildren(this._placement);
    this._initVisaFlow();
  }

  private _setConfiguration = (config: IVisaConfig, settings: IVisaSettings) =>
    settings || config ? { ...config, ...settings } : {};

  private _initVisaFlow() {
    return DomMethods.insertScript('body', this._sdkAddress).addEventListener('load', () => {
      this.attachVisaButton();
      this.initPaymentConfiguration();
      this.paymentStatusHandler();
    });
  }

  private _setLiveStatus() {
    if (this._livestatus) {
      this.visaCheckoutButtonProps.src = environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL;
      this._sdkAddress = environment.VISA_CHECKOUT_URLS.LIVE_SDK;
    }
  }

  private _getResponseMessage(type: string) {
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
}
