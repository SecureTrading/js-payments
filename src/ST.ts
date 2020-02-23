import JwtDecode from 'jwt-decode';
import 'location-origin';
import { debounce } from 'lodash';
import 'url-polyfill';
import 'whatwg-fetch';
import { CardFrames } from './core/classes/CardFrames.class';
import { CommonFrames } from './core/classes/CommonFrames.class';
import { MerchantFields } from './core/classes/MerchantFields';
import { StCodec } from './core/classes/StCodec.class';
import { ApplePay } from './core/integrations/ApplePay';
import { ApplePayMock } from './core/integrations/ApplePayMock';
import { CardinalCommerce } from './core/integrations/CardinalCommerce';
import { CardinalCommerceMock } from './core/integrations/CardinalCommerceMock';
import { GoogleAnalytics } from './core/integrations/GoogleAnalytics';
import { VisaCheckout } from './core/integrations/VisaCheckout';
import { VisaCheckoutMock } from './core/integrations/VisaCheckoutMock';
import { IApplePayConfig } from './core/models/IApplePayConfig';
import { IComponentsConfig } from './core/config/model/IComponentsConfig';
import { IConfig } from './core/config/model/IConfig';
import { IStJwtObj } from './core/models/IStJwtObj';
import { IVisaConfig } from './core/models/IVisaConfig';
import { MessageBus } from './core/shared/MessageBus';
import { Translator } from './core/shared/Translator';
import { environment } from './environments/environment';
import { PaymentEvents } from './core/models/constants/PaymentEvents';
import { Selectors } from './core/shared/Selectors';
import { Service, Inject, Container } from 'typedi';
import { CONFIG } from './core/dependency-injection/InjectionTokens';
import { ConfigService } from './core/config/ConfigService';
import { InterFrameCommunicator } from './core/services/message-bus/InterFrameCommunicator';
import { FramesHub } from './core/services/message-bus/FramesHub';
import { BrowserLocalStorage } from './core/services/storage/BrowserLocalStorage';
import { BrowserSessionStorage } from './core/services/storage/BrowserSessionStorage';

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
  private _messageBus: MessageBus;
  private _translation: Translator;

  constructor(
    @Inject(CONFIG) private _config: IConfig,
    private configProvider: ConfigService,
    private _communicator: InterFrameCommunicator,
    private _framesHub: FramesHub,
    private _storage: BrowserLocalStorage,
    private _sessionStorage: BrowserSessionStorage,
  ) {
    this._googleAnalytics = new GoogleAnalytics();
    this._merchantFields = new MerchantFields();
    this._messageBus = new MessageBus();
    this.init();
  }

  public Components(config: IComponentsConfig): void {
    config = config !== undefined ? config : ({} as IComponentsConfig);
    this._config = {...this._config, components: {...this._config.components, ...config}};
    this.configProvider.update(this._config);
    this._commonFrames.requestTypes = this._config.components.requestTypes;
    this.CardinalCommerce();
    this.CardFrames(this._config);
    this._cardFrames.init();
    this._merchantFields.init();
  }

  public ApplePay(config: IApplePayConfig): ApplePay {
    const { applepay } = this.Environment();

    return new applepay(config, this._config.jwt, this._config.datacenterurl);
  }

  public VisaCheckout(config: IVisaConfig): VisaCheckout {
    const { visa } = this.Environment();

    return new visa(config, this._config.jwt, this._config.datacenterurl, this._config.livestatus);
  }

  public updateJWT(jwt: string): void {
    if (jwt) {
      this._config = {...this._config, jwt};
      this.configProvider.update(this._config);
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
        type: MessageBus.EVENTS.DESTROY
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

    this._framesHub.init();
    this.Storage(this._config);
    this._translation = new Translator(this._storage.getItem(ST.LOCALE_STORAGE));
    this._googleAnalytics.init();
    this.CommonFrames(this._config);
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

  private CardFrames(config: IConfig): void {
    this._cardFrames = new CardFrames(
      config.jwt,
      config.origin,
      config.componentIds,
      config.styles,
      config.components.paymentTypes,
      config.components.defaultPaymentType,
      config.animatedCard,
      config.deferInit,
      config.buttonId,
      config.components.startOnLoad,
      config.fieldsToSubmit,
      config.bypassCards
    );
  }

  private CommonFrames(config: IConfig): void {
    this._commonFrames = new CommonFrames(
      config.jwt,
      config.origin,
      config.componentIds,
      config.styles,
      config.submitOnSuccess,
      config.submitOnError,
      config.submitFields,
      config.datacenterurl,
      config.animatedCard,
      config.submitCallback,
      config.components.requestTypes
    );
  }

  private Environment(): { applepay: any; cardinal: any; visa: any } {
    return {
      applepay: environment.testEnvironment ? ApplePayMock : ApplePay,
      cardinal: environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce,
      visa: environment.testEnvironment ? VisaCheckoutMock : VisaCheckout
    };
  }

  private Storage(config: IConfig): void {
    this._storage.setItem(ST.MERCHANT_TRANSLATIONS_STORAGE, JSON.stringify(config.translations));
    this._storage.setItem(ST.LOCALE_STORAGE, JwtDecode<IStJwtObj>(config.jwt).payload.locale);
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
        'font-size: 2em; font-weight: regular; color: #e71b5a',
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
}

export default (config: IConfig) => {
  Container.get(ConfigService).initialize(config);

  return Container.get(ST);
};
