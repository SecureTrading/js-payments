import { environment } from '../../environments/environment';
import { IVisaCheckoutButtonProps } from '../models/IVisaCheckoutButtonProps';
import { IVisaCheckoutInitConfiguration } from '../models/IVisaCheckoutInitConfiguration';
import { IVisaCheckoutPaymentRequest } from '../models/IVisaCheckoutPaymentRequest';
import { IVisaCheckoutConfig } from '../models/IVisaCheckoutConfig';
import { IVisaPaymentResponseTypes } from '../models/IVisaPaymentResponseTypes';
import { IVisaPaymentStatus } from '../models/IVisaPaymentStatus';
import { IVisaCheckoutSettings } from '../models/IVisaCheckoutSettings';
import { IWalletConfig } from '../models/IWalletConfig';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Notification } from '../shared/Notification';
import { Payment } from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { GoogleAnalytics } from './GoogleAnalytics';

declare const V: any;

export class VisaCheckout {
  get payment(): Payment {
    return this._payment;
  }

  set payment(value: Payment) {
    this._payment = value;
  }

  set paymentDetails(value: string): string {
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

  protected static VISA_PAYMENT_STATUS: IVisaPaymentStatus = {
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING'
  };

  private static VISA_PAYMENT_RESPONSE_TYPES: IVisaPaymentResponseTypes = {
    CANCEL: 'payment.cancel',
    ERROR: 'payment.error',
    SUCCESS: 'payment.success'
  };

  protected requestTypes: string[];
  protected visaCheckoutButtonProps: IVisaCheckoutButtonProps = {
    alt: 'Visa Checkout',
    class: 'v-button',
    id: 'v-button',
    role: 'button',
    src: environment.VISA_CHECKOUT_URLS.TEST_BUTTON_URL
  };

  private _buttonSettings: IVisaCheckoutConfig | IVisaCheckoutSettings;
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

  private _initConfiguration: IVisaCheckoutInitConfiguration = {
    apikey: '',
    paymentRequest: {
      currencyCode: '',
      subtotal: '',
      total: ''
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

  public setInitConfiguration(
    paymentRequest: IVisaCheckoutPaymentRequest,
    settings: IVisaCheckoutSettings,
    stJwt: StJwt,
    merchantId: string
  ): void {
    this._initConfiguration.apikey = merchantId;
    this._initConfiguration.paymentRequest = this.getInitPaymentRequest(paymentRequest, stJwt);
    //@ts-ignore
    this._initConfiguration.settings = this._setConfiguration({ locale: stJwt.locale }, settings);
  }

  public customizeVisaButton(properties: IVisaCheckoutConfig | IVisaCheckoutSettings): string {
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

  public getInitPaymentRequest(paymentRequest: IVisaCheckoutPaymentRequest, stJwt: StJwt): IVisaCheckoutPaymentRequest {
    const config = this._initConfiguration.paymentRequest;
    config.currencyCode = stJwt.currencyiso3a;
    config.subtotal = stJwt.mainamount;
    config.total = stJwt.mainamount;
    //@ts-ignore
    return this._setConfiguration(config, paymentRequest);
  }

  public createVisaButton = (): HTMLElement =>
    DomMethods.createHtmlElement.apply(this, [this.visaCheckoutButtonProps, 'img']);

  protected attachVisaButton = (): HTMLElement =>
    DomMethods.appendChildIntoDOM(this._placement, this.createVisaButton());

  protected onSuccess(payment: object): void {
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
      .catch(() => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
        this._getResponseMessage(this.paymentStatus);
        this._notification.error(this.responseMessage, true);
      });
  }

  protected onError(): void {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
    this._getResponseMessage(this.paymentStatus);
    this._notification.error(this.responseMessage, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  protected onCancel(): void {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.WARNING;
    this._getResponseMessage(this.paymentStatus);
    this._notification.warning(this.responseMessage, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment canceled');
  }

  protected initPaymentConfiguration(): void {
    V.init(this._initConfiguration);
  }

  protected paymentStatusHandler(): void {
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

  private _configurePaymentProcess(jwt: string, config: IWalletConfig, gatewayUrl: string): void {
    const { merchantId, livestatus, placement, settings, paymentRequest, buttonSettings, requestTypes } = config;
    this._stJwt = new StJwt(jwt);
    this.payment = new Payment(jwt, gatewayUrl);
    this._livestatus = livestatus;
    this._placement = placement;
    this.requestTypes = requestTypes;
    this.setInitConfiguration(paymentRequest, settings, this._stJwt, merchantId);
    //@ts-ignore
    this._buttonSettings = this._setConfiguration({ locale: this._stJwt.locale }, settings);
    this.customizeVisaButton(buttonSettings);
    this._setLiveStatus();
    DomMethods.removeAllChildren(this._placement);
    this._initVisaFlow();
  }

  private _setConfiguration = (
    config: IVisaCheckoutConfig | IVisaCheckoutPaymentRequest,
    settings: IVisaCheckoutSettings | IVisaCheckoutPaymentRequest
  ): IVisaCheckoutConfig | IVisaCheckoutSettings | IVisaCheckoutPaymentRequest =>
    settings || config ? { ...config, ...settings } : {};

  private _initVisaFlow(): void {
    return DomMethods.insertScript('body', this._sdkAddress).addEventListener('load', () => {
      this.attachVisaButton();
      this.initPaymentConfiguration();
      this.paymentStatusHandler();
    });
  }

  private _setLiveStatus(): void {
    if (this._livestatus) {
      this.visaCheckoutButtonProps.src = environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL;
      this._sdkAddress = environment.VISA_CHECKOUT_URLS.LIVE_SDK;
    }
  }

  private _getResponseMessage(type: string): void {
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
