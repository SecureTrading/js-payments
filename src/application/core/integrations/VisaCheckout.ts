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
import { VisaPaymentStatus } from '../models/constants/visa-checkout/VisaPaymentStatus';
import { VisaResponseTypes } from '../models/constants/visa-checkout/VisaResponseTypes';
import { VisaButtonProps } from '../models/constants/visa-checkout/VisaButtonProps';

declare const V: any;

export class VisaCheckout {
  protected requestTypes: string[];
  private _buttonSettings: any;
  private _messageBus: MessageBus;
  private _payment: Payment;
  private _paymentDetails: string;
  private _responseMessage: string;
  private _sdkAddress: string = environment.VISA_CHECKOUT_URLS.TEST_SDK;
  private _notification: NotificationService;
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
    this._messageBus = Container.get(MessageBus);
    this._notification = Container.get(NotificationService);
    this._stJwt = new StJwt(jwt);
    this._livestatus = livestatus;
    this._configurePaymentProcess(jwt, config, gatewayUrl);
    this._initVisaFlow();
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
    const url = new URL(VisaButtonProps.src);
    if (color) {
      url.searchParams.append('color', color);
    }
    if (size) {
      url.searchParams.append('size', size);
    }
    VisaButtonProps.src = url.href;
    return VisaButtonProps.src;
  }

  public getInitPaymentRequest(paymentRequest: any, stJwt: StJwt) {
    const config = this._initConfiguration.paymentRequest;
    config.currencyCode = stJwt.currencyiso3a;
    config.subtotal = stJwt.mainamount;
    config.total = stJwt.mainamount;
    return this._setConfiguration(config, paymentRequest);
  }

  public createVisaButton = () => DomMethods.createHtmlElement.apply(this, [VisaButtonProps, 'img']);

  protected attachVisaButton = () => DomMethods.appendChildIntoDOM(this._placement, this.createVisaButton());

  protected onSuccess(payment: object) {
    this._paymentDetails = JSON.stringify(payment);
    this._payment
      .processPayment(
        this.requestTypes,
        {
          walletsource: 'VISACHECKOUT',
          wallettoken: this._paymentDetails
        },
        DomMethods.parseForm()
      )
      .then(() => {
        this._getResponseMessage(VisaPaymentStatus.success);
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this._notification.success(this._responseMessage);
        GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
      })
      .catch((error: any) => {
        this._getResponseMessage(VisaPaymentStatus.error);
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(this._responseMessage);
      });
  }

  protected onError() {
    this._getResponseMessage(VisaPaymentStatus.error);
    this._notification.error(this._responseMessage);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  protected onCancel() {
    this._getResponseMessage(VisaPaymentStatus.warning);
    this._notification.warning(this._responseMessage);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment canceled');
  }

  protected initPaymentConfiguration() {
    V.init(this._initConfiguration);
  }

  protected paymentStatusHandler() {
    V.on(VisaResponseTypes.success, (payment: object) => {
      this.onSuccess(payment);
    });
    V.on(VisaResponseTypes.error, () => {
      this.onError();
    });
    V.on(VisaResponseTypes.cancel, () => {
      this.onCancel();
    });
  }

  private _configurePaymentProcess(jwt: string, config: IWalletConfig, gatewayUrl: string) {
    const { merchantId, livestatus, placement, settings, paymentRequest, buttonSettings, requestTypes } = config;
    this._stJwt = new StJwt(jwt);
    this._payment = new Payment(jwt, gatewayUrl);
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
      VisaButtonProps.src = environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL;
      this._sdkAddress = environment.VISA_CHECKOUT_URLS.LIVE_SDK;
    }
  }

  private _getResponseMessage(type: string) {
    const { error, success, warning } = VisaPaymentStatus;
    switch (type) {
      case success: {
        this._responseMessage = Language.translations.PAYMENT_SUCCESS;
        break;
      }
      case warning: {
        this._responseMessage = Language.translations.PAYMENT_CANCELLED;
        break;
      }
      case error: {
        this._responseMessage = Language.translations.PAYMENT_ERROR;
        break;
      }
    }
  }
}
