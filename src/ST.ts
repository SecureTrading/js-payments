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
  private static DEFAULT_COMPONENTS = {
    cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
    expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
    notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
    securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
  };

  private static EXTENDED_CONFIGURATION = {
    animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
    ...ST.DEFAULT_COMPONENTS
  };

  /**
   * Collect and set default values for _config object.
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
    defaultFeatures.submitOnSuccess = config.submitOnSuccess !== undefined ? config.submitOnSuccess : true;
    defaultFeatures.submitOnError = config.submitOnError !== undefined ? config.submitOnError : false;
    defaultFeatures.animatedCard = config.animatedCard ? config.animatedCard : false;
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
   * @param animatedCardComponent
   * @private
   */
  private static _addDefaultComponentIds(config: IConfig) {
    const defaultConfig: IConfig = config;
    const { animatedCard, componentIds, styles } = config;

    defaultConfig.styles = styles ? styles : {};
    defaultConfig.componentIds = componentIds ? componentIds : {};

    try {
      ST._hasConfigurationObjectsSameLength(defaultConfig.componentIds);
    } catch (e) {
      alert(e);
      throw new Error(e);
    }

    if (animatedCard) {
      defaultConfig.componentIds = defaultConfig.componentIds
        ? { ...ST.EXTENDED_CONFIGURATION, ...defaultConfig.componentIds }
        : ST.EXTENDED_CONFIGURATION;
    } else {
      defaultConfig.componentIds = defaultConfig.componentIds
        ? { ...ST.DEFAULT_COMPONENTS, ...defaultConfig.componentIds }
        : ST.DEFAULT_COMPONENTS;
    }

    return defaultConfig;
  }

  /**
   *
   * @param componentIds
   * @private
   */
  private static _hasConfigurationObjectsSameLength(componentIds: any): boolean {
    const isConfigurationExtended = Object.keys(componentIds).length !== 4;
    if (isConfigurationExtended) {
      return Object.keys(componentIds).length === Object.keys(ST.EXTENDED_CONFIGURATION).length;
    } else {
      return Object.keys(componentIds).length === Object.keys(ST.DEFAULT_COMPONENTS).length;
    }
  }

  /**
   * Uses HapiJS Joi library - object schema description language and validator for JavaScript objects.
   * Checks _config object data provided by merchant.
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
    targetConfig.requestTypes =
      targetConfig.requestTypes !== undefined ? targetConfig.requestTypes : ['THREEDQUERY', 'AUTH'];
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
    componentIds: {},
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
   * @param animatedCard
   * @private
   */
  private static _configureCardFrames(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: {},
    config: IComponentsConfig,
    animatedCard: boolean
  ) {
    const { defaultPaymentType, paymentTypes, startOnLoad } = config;
    let cardFrames: object;
    if (!startOnLoad) {
      cardFrames = new CardFrames(jwt, origin, componentIds, styles, paymentTypes, defaultPaymentType, animatedCard);
    }
    return cardFrames;
  }

  private _componentIds: {};
  private _animatedCard: boolean;
  private _cachetoken: string;
  private _gatewayUrl: string;
  private _jwt: string;
  private _origin: string;
  private _styles: IStyles;
  private _submitFields: string[];
  private _submitOnError: boolean;
  private _submitOnSuccess: boolean;
  private readonly _threedinit: string;
  private readonly _config: IConfig;
  private commonFrames: CommonFrames;

  constructor(config: IConfig) {
    if (config.init) {
      const {
        init: { cachetoken, threedinit }
      } = config;
      this._threedinit = threedinit;
      this._cachetoken = cachetoken;
    }
    this._animatedCard = config.animatedCard;
    this._config = ST._addDefaults(config);
    ST._validateConfig(this._config, IConfigSchema);
    this._setClassProperties(this._config);
    this.commonFrames = ST._configureCommonFrames(
      this._jwt,
      this._origin,
      this._componentIds,
      this._styles,
      this._submitOnSuccess,
      this._submitOnError,
      this._submitFields,
      this._gatewayUrl
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
    ST._configureCardFrames(
      this._jwt,
      this._origin,
      this._componentIds,
      this._styles,
      targetConfig,
      this._animatedCard
    );
    this.commonFrames.requestTypes = targetConfig.requestTypes;
    this.CardinalCommerce(targetConfig);
  }

  /**
   * Initializes Apple Pay APM.
   * @param config
   * @constructor
   */
  public ApplePay(config: IWalletConfig) {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['AUTH'];
    return new applepay(config, this._jwt, this._gatewayUrl);
  }

  /**
   * Initializes Visa Checkout APM.
   * @param config
   * @constructor
   */
  public VisaCheckout(config: IWalletConfig) {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['AUTH'];
    return new visa(config, this._jwt, this._gatewayUrl);
  }

  /**
   * Initializes Cardinal Commerce configuration.
   * @param config
   * @constructor
   */
  private CardinalCommerce(config: IWalletConfig) {
    const cardinal = environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce;
    return new cardinal(config.startOnLoad, this._jwt, config.requestTypes, this._cachetoken, this._threedinit);
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
      init,
      origin,
      styles,
      submitFields,
      submitOnError,
      submitOnSuccess,
      datacenterurl,
      formId
    } = config;
    this._componentIds = componentIds;
    this._jwt = jwt;
    if (init) {
      this._cachetoken = init.cachetoken;
    }
    this._origin = origin;
    this._styles = styles;
    this._submitFields = submitFields;
    this._submitOnError = submitOnError;
    this._submitOnSuccess = submitOnSuccess;
    this._gatewayUrl = datacenterurl ? datacenterurl : environment.GATEWAY_URL;
    Selectors.MERCHANT_FORM_SELECTOR = formId ? formId : Selectors.MERCHANT_FORM_SELECTOR;
  }
}

export { ST };
export default (config: IConfig) => new ST(config);
