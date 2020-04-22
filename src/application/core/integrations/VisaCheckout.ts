import { environment } from '../../../environments/environment';
import { IVisaConfig } from '../models/IVisaConfig';
import { IVisaSettings } from '../models/IVisaSettings';
import { IWalletConfig } from '../../../shared/model/config/IWalletConfig';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Payment } from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { GoogleAnalytics } from './GoogleAnalytics';
import { Container } from 'typedi';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../services/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';

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
    CANCEL: 'WARNING' // Because VisaCheckout API has warnings instead of cancel :/
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
  private _notification: NotificationService;
  private _stJwt: StJwt;
  private _livestatus: number = 0;
  private _datacenterurl: string;
  private _placement: string = 'body';
  private readonly _config$: Observable<IConfig>;
  private _visaCheckoutConfig: IWalletConfig;

  private _initConfiguration = {
    apikey: '' as string,
    paymentRequest: {
      currencyCode: '' as string,
      subtotal: '' as string,
      total: '' as string
    },
    settings: {}
  };

  constructor(private _configProvider: ConfigProvider, private _communicator: InterFrameCommunicator) {
    this._messageBus = Container.get(MessageBus);
    this._notification = Container.get(NotificationService);
    this._config$ = this._configProvider.getConfig$();

    this._config$.subscribe(config => {
      const { visaCheckout, jwt, datacenterurl, livestatus } = config;
      if (visaCheckout) {
        this._visaCheckoutConfig = visaCheckout;
      }
      this._stJwt = new StJwt(jwt);
      this._livestatus = livestatus;
      this._datacenterurl = datacenterurl;
      this._configurePaymentProcess(jwt);
      this._initVisaFlow();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { newJwt } = data;
      this._configurePaymentProcess(newJwt);
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
        DomMethods.parseForm()
      )
      .then(() => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.SUCCESS;
        this._getResponseMessage(this.paymentStatus);
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this._notification.success(this.responseMessage);
        GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
      })
      .catch((error: any) => {
        this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
        this._getResponseMessage(this.paymentStatus);
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(this.responseMessage);
      });
  }

  protected onError() {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.ERROR;
    this._getResponseMessage(this.paymentStatus);
    this._notification.error(this.responseMessage);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  protected onCancel() {
    this.paymentStatus = VisaCheckout.VISA_PAYMENT_STATUS.CANCEL;
    this._getResponseMessage(this.paymentStatus);
    this._notification.cancel(this.responseMessage);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, data: this.responseMessage }, true);
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

  private _configurePaymentProcess(jwt: string) {
    const {
      merchantId,
      livestatus,
      placement,
      settings,
      paymentRequest,
      buttonSettings,
      requestTypes
    } = this._visaCheckoutConfig;
    this._stJwt = new StJwt(jwt);
    this.payment = new Payment(jwt, this._datacenterurl);
    this._livestatus = livestatus;
    this._placement = placement;
    this.requestTypes = requestTypes;
    this.setInitConfiguration(paymentRequest, settings, this._stJwt, merchantId);
    this._buttonSettings = this._setConfiguration({ locale: this._stJwt.locale }, settings);
    this.customizeVisaButton(buttonSettings);
    this._setLiveStatus();
  }

  private _setConfiguration = (config: IVisaConfig, settings: IVisaSettings) =>
    settings || config ? { ...config, ...settings } : {};

  private _initVisaFlow() {
    DomMethods.insertScript('body', { src: this._sdkAddress, id: 'visaCheckout' }).then(() => {
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
      case VisaCheckout.VISA_PAYMENT_STATUS.CANCEL: {
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
