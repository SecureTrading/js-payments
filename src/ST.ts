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
import { IConfig } from './core/models/IConfig';
import { IStJwtObj } from './core/models/IStJwtObj';
import { ApplicationStorage } from './core/services/ApplicationStorage';
import { Config } from './core/services/Config';
import { MessageBus } from './core/shared/MessageBus';
import { Translator } from './core/shared/Translator';
import { environment } from './environments/environment';

class ST {
  private static DEBOUNCE_JWT_VALUE: number = 900;
  private static JWT_NOT_SPECIFIED_MESSAGE: string = 'Jwt has not been specified';
  private static LOCALE_STORAGE: string = 'locale';
  private static MERCHANT_TRANSLATIONS_STORAGE: string = 'merchantTranslations';
  private _cardFrames: CardFrames;
  private _commonFrames: CommonFrames;
  private _config: IConfig;
  private _configuration: Config;
  private _googleAnalytics: GoogleAnalytics;
  private _merchantFields: MerchantFields;
  private _messageBus: MessageBus;
  private _storage: ApplicationStorage;
  private _translation: Translator;

  constructor(config: IConfig) {
    this._configuration = new Config();
    this._googleAnalytics = new GoogleAnalytics();
    this._merchantFields = new MerchantFields();
    this._messageBus = new MessageBus();
    this._storage = new ApplicationStorage();
    this.Init(config);
  }

  public Components(): void {
    this.CardFrames(this._config);
    this._cardFrames.init();
    this._merchantFields.init();
  }

  public ApplePay(): ApplePay {
    const { applepay } = this.Environment();
    return new applepay(this._config.applePay, this._config.jwt, this._config.datacenterurl);
  }

  public VisaCheckout(): VisaCheckout {
    const { visa } = this.Environment();
    return new visa(this._config.visaCheckout, this._config.jwt, this._config.datacenterurl, this._config.livestatus);
  }

  public UpdateJwt(jwt: string): void {
    if (jwt) {
      this._config.jwt = jwt;
      (() => {
        const a = StCodec.updateJWTValue(jwt);
        debounce(() => a, ST.DEBOUNCE_JWT_VALUE);
      })();
    } else {
      throw Error(this._translation.translate(ST.JWT_NOT_SPECIFIED_MESSAGE));
    }
  }

  private Init(config: IConfig): void {
    this._config = this._configuration.init(config);
    this.Storage(this._config);
    this._translation = new Translator(
      this._storage.getLocalStorageItem(ST.LOCALE_STORAGE, localStorage.merchantTranslations)
    );
    this._googleAnalytics.init();
    this.CommonFrames(this._config);
    this._commonFrames.init();
    this.CardinalCommerce();
  }

  private CardinalCommerce(): CardinalCommerce {
    const { cardinal } = this.Environment();
    return new cardinal(
      this._config.components.startOnLoad,
      this._config.jwt,
      this._config.components.requestTypes,
      this._config.livestatus,
      this._config.init.cachetoken,
      this._config.init.threedinit
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
    this._storage.setLocalStorageItem(ST.MERCHANT_TRANSLATIONS_STORAGE, config.translations);
    this._storage.setLocalStorageItem(ST.LOCALE_STORAGE, JwtDecode<IStJwtObj>(config.jwt).payload.locale);
  }
}

export default (config: IConfig) => new ST(config);
