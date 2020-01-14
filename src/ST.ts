import JwtDecode from 'jwt-decode';
import 'location-origin';
import { debounce } from 'lodash';
import 'url-polyfill';
import 'whatwg-fetch';
import { CardFrames } from './core/classes/CardFrames.class';
import CommonFrames from './core/classes/CommonFrames.class';
import { MerchantFields } from './core/classes/MerchantFields';
import { StCodec } from './core/classes/StCodec.class';
import ApplePay from './core/integrations/ApplePay';
import ApplePayMock from './core/integrations/ApplePayMock';
import { CardinalCommerce } from './core/integrations/CardinalCommerce';
import CardinalCommerceMock from './core/integrations/CardinalCommerceMock';
import GoogleAnalytics from './core/integrations/GoogleAnalytics';
import VisaCheckout from './core/integrations/VisaCheckout';
import VisaCheckoutMock from './core/integrations/VisaCheckoutMock';
import { IConfig } from './core/models/Config';
import { Config } from './core/services/Config';
import { Storage } from './core/services/Storage';
import MessageBus from './core/shared/MessageBus';
import { IStJwtObj } from './core/shared/StJwt';
import { environment } from './environments/environment';

class ST {
  private _cardFrames: CardFrames;
  private _commonFrames: CommonFrames;
  private _config: IConfig;
  private _configuration: Config;
  private _googleAnalytics: GoogleAnalytics;
  private _merchantFields: MerchantFields;
  private _messageBus: MessageBus;
  private _storage: Storage;

  constructor(config: IConfig) {
    this._configuration = new Config();
    this._googleAnalytics = new GoogleAnalytics();
    this._merchantFields = new MerchantFields();
    this._messageBus = new MessageBus();
    this._storage = new Storage();
    this.Init(config);
  }

  public Components() {
    this.CardFrames(this._config);
    this._cardFrames.init();
    this._merchantFields.init();
    this.CardinalCommerce();
  }

  public ApplePay() {
    const { applepay } = this.Environment();
    return new applepay(this._config.applePay, this._config.jwt, this._config.datacenterurl);
  }

  public VisaCheckout() {
    const { visa } = this.Environment();
    return new visa(this._config.visaCheckout, this._config.jwt, this._config.datacenterurl, this._config.livestatus);
  }

  public updateJWT(newJWT: string) {
    if (newJWT) {
      this._config.jwt = newJWT;
      (() => {
        const a = StCodec.updateJWTValue(newJWT);
        debounce(() => a, 900);
      })();
    } else {
      throw Error('Jwt has not been specified');
    }
  }

  private Init(config: IConfig) {
    this._config = this._configuration.init(config);
    this._googleAnalytics.init();
    this.CommonFrames(this._config);
    this.Storage(this._config);
    this._commonFrames.init();
  }

  private Storage(config: IConfig) {
    this._storage.setLocalStorageItem('merchantTranslations', config.translations);
    this._storage.setLocalStorageItem('locale', JwtDecode<IStJwtObj>(config.jwt).payload.locale);
  }

  private CardFrames(config: IConfig) {
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
      config.fieldsToSubmit
    );
  }

  private CommonFrames(config: IConfig) {
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

  private CardinalCommerce() {
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

  private Environment() {
    return {
      applepay: environment.testEnvironment ? ApplePayMock : ApplePay,
      cardinal: environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce,
      visa: environment.testEnvironment ? VisaCheckoutMock : VisaCheckout
    };
  }
}

export default (config: IConfig) => new ST(config);
