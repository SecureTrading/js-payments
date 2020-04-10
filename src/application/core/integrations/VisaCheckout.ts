import { environment } from '../../../environments/environment';
import { IWalletConfig } from '../../../shared/model/config/IWalletConfig';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Payment } from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { GoogleAnalytics } from './GoogleAnalytics';
import { Container } from 'typedi';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { VisaResponseTypes } from '../models/constants/visa-checkout/VisaResponseTypes';
import { VisaButtonProps } from '../models/constants/visa-checkout/VisaButtonProps';
import { Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../services/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { IMerchantData } from '../models/IMerchantData';
import { IVisaInit } from '../models/IVisaInit';

declare const V: any;

export class VisaCheckout {
  private _stJwt: StJwt;
  private _messageBus: MessageBus;
  private _payment: Payment;
  private _notification: NotificationService;
  private _config: IWalletConfig;
  private readonly _config$: Observable<IConfig>;
  private _requestTypes: string[];
  private _urls = {
    buttonUrl: '',
    sdkUrl: ''
  };

  private _visaInit: IVisaInit;

  constructor(private _configProvider: ConfigProvider, private _communicator: InterFrameCommunicator) {
    this._messageBus = Container.get(MessageBus);
    this._notification = Container.get(NotificationService);
    this._config$ = this._configProvider.getConfig$();
    this._communicator.whenReceive(MessageBus.EVENTS_PUBLIC.CONFIG_CHECK).thenRespond(() => this._config$);
    this._config$.subscribe(config => {
      this._init(config);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (response: any) => {
      this._updateJwt(response.newJwt);
      this._setInitConfig();
      this._customizeButton();
    });
  }

  private _init(config: IConfig) {
    this._config = config;
    const { jwt, visaCheckout } = config;
    const { placement, livestatus, requestTypes } = visaCheckout;
    this._requestTypes = requestTypes;
    this._visaInit = {
      apikey: visaCheckout.merchantId,
      settings: visaCheckout.settings,
      paymentRequest: visaCheckout.paymentRequest
    };
    this._updateJwt(jwt);
    this._setInitConfig();
    this._customizeButton();
    this._setEnvUrls(livestatus);
    this._loadSdk(placement);
  }

  private _loadSdk(target: string) {
    DomMethods.insertScript(target, { src: this._urls.sdkUrl, id: 'visaCheckout' })
      .then(() => {
        this._injectButton(target);
        this._instantiateVisa();
        this._paymentStatusHandler();
      })
      .catch((e: any) => {
        throw new Error(e);
      });
  }

  private _setEnvUrls(livestatus: 0 | 1): void {
    this._urls = {
      buttonUrl: livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL : VisaButtonProps.src,
      sdkUrl: livestatus ? environment.VISA_CHECKOUT_URLS.TEST_SDK : environment.VISA_CHECKOUT_URLS.LIVE_SDK
    };
  }

  private _updateJwt(jwt: string): void {
    const { datacenterurl } = this._config;
    this._stJwt = new StJwt(jwt);
    this._payment = new Payment(jwt, datacenterurl);
  }

  private _setInitConfig(): void {
    const { merchantId } = this._config.visaCheckout;
    const { currencyiso3a, locale, mainamount } = this._stJwt;
    this._visaInit.apikey = merchantId;
    this._visaInit.paymentRequest.currencyCode = currencyiso3a;
    this._visaInit.paymentRequest.subtotal = mainamount;
    this._visaInit.paymentRequest.total = mainamount;
    this._visaInit.settings.locale = locale;
  }

  private _customizeButton() {
    const { buttonSettings } = this._config.visaCheckout;
    const url = new URL(VisaButtonProps.src);
    this._urls.buttonUrl = url.href;
    Object.keys(buttonSettings).forEach((item: any) => {
      if (buttonSettings[item]) {
        url.searchParams.append(`${item}`, buttonSettings[item]);
      }
    });
  }

  private _createButton = (): HTMLElement => DomMethods.createHtmlElement.apply(this, [VisaButtonProps, 'img']);

  private _injectButton = (target: string): Element => DomMethods.appendChildIntoDOM(target, this._createButton());

  protected onSuccess(payment: object) {
    const paymentData = {
      walletsource: 'VISACHECKOUT',
      wallettoken: JSON.stringify(payment)
    };
    const merchantData: IMerchantData = {
      ...DomMethods.parseForm()
    };
    this._payment
      .processPayment(this._requestTypes, paymentData, merchantData)
      .then(() => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this._notification.success(Language.translations.PAYMENT_SUCCESS);
        GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
      })
      .catch((error: any) => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(Language.translations.PAYMENT_ERROR);
      });
  }

  protected onError() {
    this._notification.error(Language.translations.PAYMENT_ERROR);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
  }

  protected onCancel() {
    this._notification.warning(Language.translations.PAYMENT_CANCELLED);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment canceled');
  }

  private _instantiateVisa() {
    V.init(this._visaInit);
  }

  private _paymentStatusHandler(): void {
    const { cancel, error, success } = VisaResponseTypes;
    V.on(success, (payment: object) => {
      console.error(payment);
      this.onSuccess(payment);
    });
    V.on(error, () => {
      this.onError();
    });
    V.on(cancel, () => {
      this.onCancel();
    });
  }
}
