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
import {
  IConfig,
  IConfigSchema,
  IComponentsConfig,
  IComponentsConfigSchema,
  IWalletConfig
} from './core/models/Config';
import Selectors from './core/shared/Selectors';
import { IStyles } from './core/shared/Styler';
import { environment } from './environments/environment';

/**
 * Establishes connection with ST, defines client.
 */
class ST {
  /**
   * Collect and set default values for config object.
   * @param config
   * @private
   */
  private static _addDefaults(config: IConfig) {
    config.origin = config.origin ? config.origin : window.location.origin;
    config.tokenise = config.tokenise !== undefined ? config.tokenise : false;
    config.submitOnSuccess = config.submitOnSuccess !== undefined ? config.submitOnSuccess : true;
    config.submitOnError = config.submitOnError !== undefined ? config.submitOnError : false;
    config.submitFields = config.submitFields
      ? config.submitFields
      : [
          'baseamount',
          'currencyiso3a',
          'eci',
          'enrolled',
          'errorcode',
          'errordata',
          'errormessage',
          'orderreference',
          'settlestatus',
          'status',
          'transactionreference'
        ];
    const componentIds = {
      animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
      cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
      expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
      notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
      securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
    };
    config.componentIds = config.componentIds ? { ...componentIds, ...config.componentIds } : componentIds;
    config.styles = config.styles ? config.styles : {};
    return config;
  }

  /**
   * Uses HapiJS Joi library - object schema description language and validator for JavaScript objects, to check config object data provided by merchant.
   * @param config
   * @param schema
   */
  private static _validateConfig(config: IConfig | IComponentsConfig, schema: Joi.JoiObject) {
    Joi.validate(config, schema, (error, value) => {
      if (error !== null) {
        throw error;
      }
    });
  }

  private readonly componentIds: [];
  private readonly gatewayUrl: string;
  private readonly jwt: string;
  private readonly origin: string;
  private readonly styles: IStyles;
  private readonly submitFields: string[];
  private readonly submitOnError: boolean;
  private readonly submitOnSuccess: boolean;
  private readonly tokenise: boolean;

  constructor(config: IConfig) {
    config = ST._addDefaults(config);
    ST._validateConfig(config, IConfigSchema);
    this.componentIds = config.componentIds;
    this.jwt = config.jwt;
    this.origin = config.origin;
    this.styles = config.styles;
    this.submitFields = config.submitFields;
    this.submitOnError = config.submitOnError;
    this.submitOnSuccess = config.submitOnSuccess;
    this.tokenise = config.tokenise;
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

  /**
   * If startOnLoad is false, initializes all necessary components, otherwise proceeds immediate payment configuration.
   * @param config
   * @constructor
   */
  public Components(config?: IComponentsConfig) {
    config = config ? config : ({} as IComponentsConfig);
    config.startOnLoad = config.startOnLoad !== undefined ? config.startOnLoad : false;
    ST._validateConfig(config, IComponentsConfigSchema);
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
    const cardinalInstance = new cardinal(this.tokenise, config.startOnLoad, this.jwt);
  }

  /**
   * Initializes Apple Pay APM.
   * @param config
   * @constructor
   */
  public ApplePay(config: IWalletConfig) {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    const instance = new applepay(config, this.tokenise, this.jwt, this.gatewayUrl);
  }

  /**
   * Initializes Visa Checkout APM.
   * @param config
   * @constructor
   */
  public VisaCheckout(config: IWalletConfig) {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
    const instance = new visa(config, this.tokenise, this.jwt, this.gatewayUrl);
  }
}

export default (config: IConfig) => new ST(config);
