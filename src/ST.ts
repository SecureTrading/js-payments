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
  IComponentsConfig,
  IComponentsConfigSchema,
  IConfig,
  IConfigSchema,
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
    const configWithFeatures = ST._addDefaultFeatures(config);
    const configWithSubmitFields = ST._addDefaultSubmitFields(configWithFeatures);
    return ST._addDefaultComponentIds(configWithSubmitFields);
  }

  /**
   * Adds default submit fields if merchant didn't specified once.
   * @param config
   * @private
   */
  private static _addDefaultFeatures(config: IConfig) {
    const defaultFeatures: IConfig = config;
    defaultFeatures.origin = config.origin ? config.origin : window.location.origin;
    defaultFeatures.tokenise = config.tokenise !== undefined ? config.tokenise : false;
    defaultFeatures.submitOnSuccess = config.submitOnSuccess !== undefined ? config.submitOnSuccess : true;
    defaultFeatures.submitOnError = config.submitOnError !== undefined ? config.submitOnError : false;
    return defaultFeatures;
  }

  /**
   * Adds default submit fields if merchant didn't specified once.
   * @param config
   * @private
   */
  private static _addDefaultSubmitFields(config: IConfig) {
    const defaultSubmitFields: IConfig = config;
    defaultSubmitFields.submitFields = config.submitFields
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
    return defaultSubmitFields;
  }

  /**
   * Adds default component Ids if merchant didn't specified once.
   * @param config
   * @private
   */
  private static _addDefaultComponentIds(config: IConfig) {
    const defaultComponentIds: IConfig = config;
    const componentIds = {
      animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
      cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
      expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
      notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
      securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
    };
    defaultComponentIds.componentIds = config.componentIds ? { ...componentIds, ...config.componentIds } : componentIds;
    defaultComponentIds.styles = config.styles ? config.styles : {};
    return defaultComponentIds;
  }

  /**
   * Uses HapiJS Joi library - object schema description language and validator for JavaScript objects.
   * Checks config object data provided by merchant.
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

  /**
   * Prepares target configuration object.
   * @param config
   * @private
   */
  private static _setConfigObject(config: IComponentsConfig) {
    let targetConfig: IComponentsConfig;
    targetConfig = config ? config : ({} as IComponentsConfig);
    targetConfig.startOnLoad = targetConfig.startOnLoad !== undefined ? targetConfig.startOnLoad : false;
    return { targetConfig };
  }

  /**
   *
   * @param jwt
   * @param origin
   * @param componentIds
   * @param styles
   * @param submitOnSuccess
   * @param submitOnError
   * @param submitFields
   * @param gatewayUrl
   * @private
   */
  private static _configureCommonFrames(
    jwt: string,
    origin: string,
    componentIds: [],
    styles: {},
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[],
    gatewayUrl: string
  ) {
    return new CommonFrames(
      jwt,
      origin,
      componentIds,
      styles,
      submitOnSuccess,
      submitOnError,
      submitFields,
      gatewayUrl
    );
  }

  /**
   * Adds fields form merchants form as part of library flow (eg. fields validation).
   */
  private static _configureMerchantFields() {
    return new MerchantFields();
  }

  /**
   *
   * @param jwt
   * @param origin
   * @param componentIds
   * @param styles
   * @param config
   */
  private static _configureCardFrames(
    jwt: string,
    origin: string,
    componentIds: [],
    styles: {},
    config: IComponentsConfig
  ) {
    const { defaultPaymentType, paymentTypes, startOnLoad } = config;
    let cardFrames: object;
    if (!startOnLoad) {
      cardFrames = new CardFrames(jwt, origin, componentIds, styles, paymentTypes, defaultPaymentType);
    }
    return cardFrames;
  }

  private componentIds: [];
  private gatewayUrl: string;
  private jwt: string;
  private jwtOnInit: string;
  private merchantCacheToken: string;
  private origin: string;
  private styles: IStyles;
  private submitFields: string[];
  private submitOnError: boolean;
  private submitOnSuccess: boolean;
  private tokenise: boolean;
  private readonly config: IConfig;

  constructor(config: IConfig) {
    const { jwtOnInit, merchantCacheToken } = config;
    this.config = ST._addDefaults(config);
    this.jwtOnInit = jwtOnInit;
    this.merchantCacheToken = merchantCacheToken;
    ST._validateConfig(this.config, IConfigSchema);
    this._setClassProperties(this.config);
    ST._configureCommonFrames(
      this.jwt,
      this.origin,
      this.componentIds,
      this.styles,
      this.submitOnSuccess,
      this.submitOnError,
      this.submitFields,
      this.gatewayUrl
    );
    ST._configureMerchantFields();
  }

  /**
   * If startOnLoad is false, initializes all necessary components, otherwise proceeds immediate payment configuration.
   * @param config
   * @constructor
   */
  public Components(config?: IComponentsConfig) {
    const { targetConfig } = ST._setConfigObject(config);
    ST._validateConfig(targetConfig, IComponentsConfigSchema);
    ST._configureCardFrames(this.jwt, this.origin, this.componentIds, this.styles, targetConfig);
    this.CardinalCommerce(targetConfig);
  }

  /**
   * Initializes Apple Pay APM.
   * @param config
   * @constructor
   */
  public ApplePay(config: IWalletConfig) {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    return new applepay(config, this.tokenise, this.jwt, this.gatewayUrl);
  }

  /**
   * Initializes Visa Checkout APM.
   * @param config
   * @constructor
   */
  public VisaCheckout(config: IWalletConfig) {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
    return new visa(config, this.tokenise, this.jwt, this.gatewayUrl);
  }

  /**
   * Initializes Cardinal Commerce configuration.
   * @param config
   * @constructor
   */
  private CardinalCommerce(config: IWalletConfig) {
    const cardinal = environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce;
    return new cardinal(this.tokenise, config.startOnLoad, this.jwt, this.merchantCacheToken, this.jwtOnInit);
  }

  /**
   * Sets class properties based on configuration indicated by merchant.
   * @param config
   * @private
   */
  private _setClassProperties(config: IConfig) {
    const {
      componentIds,
      jwt,
      merchantCacheToken,
      origin,
      styles,
      submitFields,
      submitOnError,
      submitOnSuccess,
      tokenise,
      datacenterurl,
      formId
    } = config;
    this.componentIds = componentIds;
    this.jwt = jwt;
    this.merchantCacheToken = merchantCacheToken ? merchantCacheToken : '';
    this.origin = origin;
    this.styles = styles;
    this.submitFields = submitFields;
    this.submitOnError = submitOnError;
    this.submitOnSuccess = submitOnSuccess;
    this.tokenise = tokenise;
    this.gatewayUrl = datacenterurl ? datacenterurl : environment.GATEWAY_URL;
    Selectors.MERCHANT_FORM_SELECTOR = formId ? formId : Selectors.MERCHANT_FORM_SELECTOR;
  }
}

export default (config: IConfig) => new ST(config);
