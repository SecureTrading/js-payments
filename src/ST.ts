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
  private _messageBus: MessageBus;
  private _merchantFields: MerchantFields;
  private _configuration: Config;
  private _config: IConfig;
  private _googleAnalytics: GoogleAnalytics;
  private _commonFrames: CommonFrames;
  private _cardFrames: CardFrames;
  private _storage: Storage;

  constructor(config: IConfig) {
    this._messageBus = new MessageBus();
    this._googleAnalytics = new GoogleAnalytics();
    this._configuration = new Config();
    this._merchantFields = new MerchantFields();
    this._googleAnalytics.init();
    this._config = this._configuration.init(config);
    this._commonFrames = new CommonFrames(
      this._config.jwt,
      this._config.origin,
      this._config.componentIds,
      this._config.styles,
      this._config.submitOnSuccess,
      this._config.submitOnError,
      this._config.submitFields,
      this._config.datacenterurl,
      this._config.animatedCard,
      this._config.submitCallback
    );
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
      this._config.fieldsToSubmit
    );
    this._storage.setLocalStorageItem('merchantTranslations', this._config.translations);
    this._storage.setLocalStorageItem('locale', JwtDecode<IStJwtObj>(this._config.jwt).payload.locale);
  }

  public Components() {
    this._commonFrames.init();
    this._merchantFields.init();
    this._cardFrames.init();
    this._cardinalCommerce();
  }

  public ApplePay() {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    return new applepay(this._config.applePay, this._config.jwt, this._config.datacenterurl);
  }

  public VisaCheckout() {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
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

  private _cardinalCommerce() {
    const cardinal = environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce;
    return new cardinal(
      this._config.components.startOnLoad,
      this._config.jwt,
      this._config.components.requestTypes,
      this._config.livestatus,
      this._config.init.cachetoken,
      this._config.init.threedinit
    );
  }
}

export { ST };
export default (config: IConfig) => new ST(config);
