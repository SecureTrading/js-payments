import JwtDecode from 'jwt-decode';
import 'location-origin';
import { debounce } from 'lodash';
import 'url-polyfill';
import 'whatwg-fetch';
import '../application/core/shared/OverrideDomain';
import { CardFrames } from './classes/CardFrames.class';
import { CommonFrames } from './classes/CommonFrames.class';
import { MerchantFields } from './classes/MerchantFields';
import { StCodec } from '../application/core/services/StCodec.class';
import { ApplePay } from '../application/core/integrations/ApplePay';
import { ApplePayMock } from '../application/core/integrations/ApplePayMock';
import { CardinalCommerce } from '../application/core/integrations/CardinalCommerce';
import { CardinalCommerceMock } from '../application/core/integrations/CardinalCommerceMock';
import { GoogleAnalytics } from '../application/core/integrations/GoogleAnalytics';
import { VisaCheckout } from '../application/core/integrations/VisaCheckout';
import { VisaCheckoutMock } from '../application/core/integrations/VisaCheckoutMock';
import { IApplePayConfig } from '../application/core/models/IApplePayConfig';
import { IComponentsConfig } from '../shared/model/config/IComponentsConfig';
import { IConfig } from '../shared/model/config/IConfig';
import { IStJwtObj } from '../application/core/models/IStJwtObj';
import { IVisaConfig } from '../application/core/models/IVisaConfig';
import { MessageBus } from '../application/core/shared/MessageBus';
import { Translator } from '../application/core/shared/Translator';
import { environment } from '../environments/environment';
import { PaymentEvents } from '../application/core/models/constants/PaymentEvents';
import { Selectors } from '../application/core/shared/Selectors';
import { Service, Inject, Container } from 'typedi';
import { CONFIG } from '../application/core/dependency-injection/InjectionTokens';
import { ConfigService } from './config/ConfigService';
import { ISubmitEvent } from '../application/core/models/ISubmitEvent';
import { ISuccessEvent } from '../application/core/models/ISuccessEvent';
import { IErrorEvent } from '../application/core/models/IErrorEvent';
import { InterFrameCommunicator } from '../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../shared/services/message-bus/FramesHub';
import { BrowserLocalStorage } from '../shared/services/storage/BrowserLocalStorage';
import { BrowserSessionStorage } from '../shared/services/storage/BrowserSessionStorage';
import { Notification } from '../application/core/shared/Notification';
import './../styles/notification.css';
import { ConfigProvider } from '../application/core/services/ConfigProvider';
import { switchMap, first } from 'rxjs/operators';
import { from } from 'rxjs';
import { NotificationService } from './classes/notification/NotificationService';

@Service()
class ST {
  private static DEBOUNCE_JWT_VALUE: number = 900;
  private static JWT_NOT_SPECIFIED_MESSAGE: string = 'Jwt has not been specified';
  private static LOCALE_STORAGE: string = 'locale';
  private static MERCHANT_TRANSLATIONS_STORAGE: string = 'merchantTranslations';
  private _cardFrames: CardFrames;
  private _commonFrames: CommonFrames;
  private _googleAnalytics: GoogleAnalytics;
  private _merchantFields: MerchantFields;
  private _translation: Translator;

  set submitCallback(callback: (event: ISubmitEvent) => void) {
    if (callback) {
      this.on('submit', callback);
    } else {
      this.off('submit');
    }
  }

  set successCallback(callback: (event: ISuccessEvent) => void) {
    if (callback) {
      this.on('success', callback);
    } else {
      this.off('success');
    }
  }

  set errorCallback(callback: (event: IErrorEvent) => void) {
    if (callback) {
      this.on('error', callback);
    } else {
      this.off('error');
    }
  }

  set cancelCallback(callback: (event: IErrorEvent) => void) {
    if (callback) {
      this.on('cancel', callback);
    } else {
      this.off('cancel');
    }
  }

  constructor(
    @Inject(CONFIG) private _config: IConfig,
    private _configService: ConfigService,
    private _configProvider: ConfigProvider,
    private _communicator: InterFrameCommunicator,
    private _framesHub: FramesHub,
    private _storage: BrowserLocalStorage,
    private _sessionStorage: BrowserSessionStorage,
    private _messageBus: MessageBus,
    private _notification: Notification,
    private _notificationService: NotificationService
  ) {
    this._googleAnalytics = new GoogleAnalytics();
    this._merchantFields = new MerchantFields();
    this.init();
  }

  public on(event: string, callback: any): void {
    const events = {
      cancel: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK,
      success: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK,
      error: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK,
      submit: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUBMIT_CALLBACK
    };
    // @ts-ignore
    this._messageBus.subscribe(events[event], data => {
      callback(data);
    });
  }

  public off(event: string): void {
    // @ts-ignore
  }

  public Components(config: IComponentsConfig): void {
    this._framesHub.waitForFrame(Selectors.CONTROL_FRAME_IFRAME).subscribe(async controlFrame => {
      this._config = this._configService.update({
        ...this._config,
        components: {
          ...this._config.components,
          ...(config || {})
        }
      });
      this._commonFrames.requestTypes = this._config.components.requestTypes;
      this.CardinalCommerce();
      await this._communicator.query({ type: MessageBus.EVENTS_PUBLIC.CONFIG_CHECK }, controlFrame);
      this.CardFrames();
      this._cardFrames.init();
      this._merchantFields.init();
    });
  }

  public ApplePay(config: IApplePayConfig): ApplePay {
    const { applepay } = this.Environment();
    this._config = this._configService.update({
      ...this._config,
      applePay: {
        ...this._config.applePay,
        ...(config || {})
      }
    });
    return new applepay(this._configProvider, this._communicator);
  }

  public VisaCheckout(config: IVisaConfig): VisaCheckout {
    const { visa } = this.Environment();
    this._config = this._configService.update({
      ...this._config,
      visaCheckout: {
        ...this._config.visaCheckout,
        ...(config || {})
      }
    });

    return new visa(this._configProvider, this._communicator, this._messageBus, this._notificationService);
  }

  public Cybertonica(): Promise<string> {
    return new Promise(resolve =>
      this._framesHub
        .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
        .pipe(
          switchMap((controlFrame: string) =>
            from(this._communicator.query({ type: MessageBus.EVENTS_PUBLIC.GET_CYBERTONICA_TID }, controlFrame))
          )
        )
        .subscribe((tid: string) => {
          resolve(tid);
        })
    );
  }

  public updateJWT(jwt: string): void {
    if (jwt) {
      this._config = { ...this._config, jwt };
      this._configService.update(this._config);
      (() => {
        const a = StCodec.updateJWTValue(jwt);
        debounce(() => a, ST.DEBOUNCE_JWT_VALUE);
      })();
    } else {
      throw Error(this._translation.translate(ST.JWT_NOT_SPECIFIED_MESSAGE));
    }
  }

  public destroy(): void {
    this._messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.DESTROY
      },
      true
    );

    const cardinal = (window as any).Cardinal;

    if (cardinal) {
      cardinal.off(PaymentEvents.SETUP_COMPLETE);
      cardinal.off(PaymentEvents.VALIDATED);
    }

    this._communicator.close();
  }

  private init(): void {
    // TODO theres probably a better way rather than having to remember to update Selectors
    Selectors.MERCHANT_FORM_SELECTOR = this._config.formId;
    this.initCallbacks();
    this.Storage();
    this._translation = new Translator(this._storage.getItem(ST.LOCALE_STORAGE));
    this._googleAnalytics.init();
    this.CommonFrames();
    this._commonFrames.init();
    this.displayLiveStatus(Boolean(this._config.livestatus));
    this.watchForFrameUnload();
  }

  private CardinalCommerce(): CardinalCommerce {
    const { cardinal } = this.Environment();
    return new cardinal(
      this._config.components.startOnLoad,
      this._config.jwt,
      this._config.components.requestTypes,
      this._config.livestatus,
      this._config.init.cachetoken,
      this._config.init.threedinit,
      this._config.bypassCards
    );
  }

  private CardFrames(): void {
    this._cardFrames = new CardFrames(
      this._config.jwt,
      this._config.origin,
      this._config.componentIds,
      this._config.styles,
      this._config.components.paymentTypes,
      this._config.components.defaultPaymentType,
      this._config.animatedCard,
      this._config.deferInit,
      this._config.buttonId,
      this._config.components.startOnLoad,
      this._config.fieldsToSubmit,
      this._config.bypassCards
    );
  }

  private CommonFrames(): void {
    this._commonFrames = new CommonFrames(
      this._config.jwt,
      this._config.origin,
      this._config.componentIds,
      this._config.styles,
      this._config.submitOnSuccess,
      this._config.submitOnError,
      this._config.submitOnCancel,
      this._config.submitFields,
      this._config.datacenterurl,
      this._config.animatedCard,
      this._config.components.requestTypes
    );
  }

  private Environment(): { applepay: any; cardinal: any; visa: any } {
    return {
      applepay: environment.testEnvironment ? ApplePayMock : ApplePay,
      cardinal: environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce,
      visa: environment.testEnvironment ? VisaCheckoutMock : VisaCheckout
    };
  }

  private Storage(): void {
    this._storage.setItem(ST.MERCHANT_TRANSLATIONS_STORAGE, JSON.stringify(this._config.translations));
    this._storage.setItem(ST.LOCALE_STORAGE, JwtDecode<IStJwtObj>(this._config.jwt).payload.locale);
  }

  private displayLiveStatus(liveStatus: boolean): void {
    if (!liveStatus) {
      /* tslint:disable:no-console */
      console.log(
        '%cThe %csecure%c//%ctrading %cLibrary is currently working in test mode. Please check your configuration.',
        'margin: 100px 0; font-size: 2em; color: #e71b5a',
        'font-size: 2em; font-weight: bold',
        'font-size: 2em; font-weight: 1000; color: #e71b5a',
        'font-size: 2em; font-weight: bold',
        'font-size: 2em; font-weight: regular; color: #e71b5a'
      );
    }
  }

  private watchForFrameUnload(): void {
    const controlFrameStatus = [false, false];

    const observer = new MutationObserver(() => {
      const controlFrame = document.getElementById(Selectors.CONTROL_FRAME_IFRAME);

      controlFrameStatus.push(Boolean(controlFrame));
      controlFrameStatus.shift();

      const [previousStatus, currentStatus] = controlFrameStatus;

      if (previousStatus && !currentStatus) {
        this.destroy();
        observer.disconnect();
      }
    });

    observer.observe(document, {
      subtree: true,
      childList: true
    });
  }

  private initCallbacks(): void {
    if (this._config.submitCallback) {
      this.submitCallback = this._config.submitCallback;
    }

    if (this._config.successCallback) {
      this.successCallback = this._config.successCallback;
    }

    if (this._config.errorCallback) {
      this.errorCallback = this._config.errorCallback;
    }

    if (this._config.cancelCallback) {
      this.cancelCallback = this._config.cancelCallback;
    }
  }
}

export default (config: IConfig) => {
  Container.get(ConfigService).update(config);

  return Container.get(ST);
};
