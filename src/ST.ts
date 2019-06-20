import Joi from 'joi';
import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import CardFrames from './core/classes/CardFrames.class';
import CommonFrames from './core/classes/CommonFrames.class';
import { MerchantFields } from './core/classes/MerchantFields';
import ApplePay from './core/integrations/ApplePay';
import ApplePayMock from './core/integrations/ApplePayMock';
import { CardinalCommerce } from './core/integrations/CardinalCommerce';
import CardinalCommerceMock from './core/integrations/CardinalCommerceMock';
import VisaCheckout from './core/integrations/VisaCheckout';
import VisaCheckoutMock from './core/integrations/VisaCheckoutMock';
import { IComponentsConfig, IConfig, IWalletConfig } from './core/models/Config';
import Selectors from './core/shared/Selectors';
import { IStyles } from './core/shared/Styler';
import { environment } from './environments/environment';

const IConfigSchema: Joi.JoiObject = Joi.object().keys({
  componentIds: Joi.object().keys({
    animatedCard: Joi.string().required(),
    cardNumber: Joi.string().required(),
    expirationDate: Joi.string().required(),
    notificationFrame: Joi.string().required(),
    securityCode: Joi.string().required()
  }),
  datacenterurl: Joi.string(),
  formId: Joi.string(),
  jwt: Joi.string().required(),
  origin: Joi.string(),
  styles: Joi.object(),
  submitFields: Joi.array().allow([Joi.string()]),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean()
});

const IComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  requestTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});

/**
 * Establishes connection with ST, defines client.
 */
class ST {
  private static GATEWAY_URL = environment.GATEWAY_URL;
  private componentIds: any;
  private jwt: string;
  private origin: string;
  private styles: IStyles;
  private submitFields: string[];
  private submitOnError: boolean;
  private submitOnSuccess: boolean;
  private gatewayUrl: string;

  /**
   * Defines static methods for starting different payment methods
   * @private
   */

  constructor(config: IConfig) {
    config = this._addDefaults(config);
    this.validateConfig(config, IConfigSchema);
    this.componentIds = config.componentIds;
    this.jwt = config.jwt;
    this.origin = config.origin;
    this.styles = config.styles;
    this.submitFields = config.submitFields;
    this.submitOnError = config.submitOnError;
    this.submitOnSuccess = config.submitOnSuccess;
    this.gatewayUrl = config.datacenterurl ? config.datacenterurl : environment.GATEWAY_URL;
    Selectors.MERCHANT_FORM_SELECTOR = config.formId ? config.formId : Selectors.MERCHANT_FORM_SELECTOR;
    const instance = new CommonFrames(
      this.jwt,
      this.origin,
      this.componentIds,
      this.styles,
      this.submitOnSuccess,
      this.submitOnError,
      this.submitFields,
      this.gatewayUrl
    );
    const merchantFields = new MerchantFields();
  }

  public Components(config?: IComponentsConfig) {
    config = config ? config : ({} as IComponentsConfig);
    config.startOnLoad = config.startOnLoad !== undefined ? config.startOnLoad : false;
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['THREEDQUERY', 'AUTH'];
    this.validateConfig(config, IComponentsConfigSchema);
    if (!config.startOnLoad) {
      const instance = new CardFrames(
        this.jwt,
        this.origin,
        this.componentIds,
        this.styles,
        config.paymentTypes,
        config.defaultPaymentType
      );
    }
    const cardinal = environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce;
    const cardinalInstance = new cardinal(config.startOnLoad, this.jwt, config.requestTypes);
  }

  public ApplePay(config: IWalletConfig) {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['AUTH'];
    const instance = new applepay(config, this.jwt, this.gatewayUrl);
  }

  public VisaCheckout(config: IWalletConfig) {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['AUTH'];
    const instance = new visa(config, this.jwt, this.gatewayUrl);
  }

  private validateConfig(config: IConfig | IComponentsConfig, schema: Joi.JoiObject) {
    Joi.validate(config, schema, (error, value) => {
      if (error !== null) {
        throw error;
      }
    });
  }

  private _addDefaults(config: IConfig) {
    config.origin = config.origin ? config.origin : window.location.origin;
    config.submitOnSuccess = config.submitOnSuccess !== undefined ? config.submitOnSuccess : true;
    config.submitOnError = config.submitOnError !== undefined ? config.submitOnError : false;
    config.submitFields = config.submitFields ? config.submitFields : ['errorcode', 'errordata', 'errormessage'];
    const componentIds = {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
      expirationDate: 'st-expiration-date',
      notificationFrame: 'st-notification-frame',
      securityCode: 'st-security-code'
    };
    config.componentIds = config.componentIds ? { ...componentIds, ...config.componentIds } : componentIds;
    config.styles = config.styles ? config.styles : {};
    return config;
  }
}

export default (config: IConfig) => new ST(config);
