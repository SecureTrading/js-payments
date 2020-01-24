import Joi from 'joi';
import { environment } from '../../environments/environment';
import { ComponentsConfigSchema } from '../models/constants/ComponentsConfigSchema';
import { IComponentsConfig } from '../models/IComponentsConfig';
import { IComponentsIds } from '../models/IComponentsIds';
import { IConfig } from '../models/IConfig';
import { IWalletConfig } from '../models/IWalletConfig';
import { Selectors } from '../shared/Selectors';

export class Config {
  private static DEFAULT_COMPONENTS_IDS: IComponentsIds = {
    animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
    cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
    expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
    notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
    securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
  };

  private static DEFAULT_APMS_REQUEST_TYPES: string[] = ['AUTH'];
  private static DEFAULT_COMPONENTS_REQUEST_TYPES: string[] = ['THREEDQUERY', 'AUTH'];
  private static DEFAULT_FIELDS_TO_SUBMIT: string[] = ['pan', 'expirydate', 'securitycode'];
  private static DEFAULT_SUBMIT_PROPERTIES: string[] = [
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

  public init(config: IConfig): IConfig {
    return {
      ...this._returnConfig(config)
    };
  }

  public validate(config: IConfig | IComponentsConfig | IComponentsIds, schema: Joi.JoiObject) {
    Joi.validate(config, schema, (error, value) => {
      if (error !== null) {
        throw error;
      }
    });
  }

  private _returnConfig(config: IConfig): IConfig {
    return {
      analytics: config.analytics !== undefined ? config.analytics : false,
      animatedCard: config.animatedCard !== undefined ? config.animatedCard : true,
      applePay: this._setApmConfig(config.applePay, config.components),
      buttonId: config.buttonId !== undefined ? config.buttonId : '',
      bypassCards: config.bypassCards !== undefined ? config.bypassCards : [],
      componentIds: this._componentIds(config.componentIds),
      components: this._setComponentsProperties(config),
      cybertonica: config.cybertonica !== undefined ? config.cybertonica : { apikey: '' },
      datacenterurl: config.datacenterurl !== undefined ? config.datacenterurl : environment.GATEWAY_URL,
      deferInit: config.deferInit !== undefined ? config.deferInit : false,
      formId: config.formId !== undefined ? config.formId : Selectors.MERCHANT_FORM_SELECTOR,
      init: config.init !== undefined ? config.init : { cachetoken: '', threedinit: '' },
      jwt: config.jwt !== undefined ? config.jwt : '',
      livestatus: config.livestatus !== undefined ? config.livestatus : 0,
      origin: config.origin !== undefined ? config.origin : window.location.origin,
      styles: config.styles ? config.styles : {},
      submitCallback: config.submitCallback !== undefined ? config.submitCallback : null,
      submitFields: config.submitFields !== undefined ? config.submitFields : [],
      submitOnError: config.submitOnError !== undefined ? config.submitOnError : false,
      submitOnSuccess: config.submitOnSuccess !== undefined ? config.submitOnSuccess : false,
      translations: config.translations ? config.translations : {},
      visaCheckout: this._setApmConfig(config.visaCheckout, config.components),
      ...this._setFieldsToSubmit(config),
      ...this._setPropertiesToSubmit(config)
    };
  }

  private _componentIds(config: IComponentsIds): IComponentsIds {
    if (!config) {
      return { ...Config.DEFAULT_COMPONENTS_IDS };
    }
    this.validate(config, ComponentsConfigSchema);
    const optionalIds = config.animatedCard !== undefined ? { animatedCard: config.animatedCard } : {};
    const requiredIds = {
      cardNumber: config.cardNumber !== undefined ? config.cardNumber : Config.DEFAULT_COMPONENTS_IDS.cardNumber,
      expirationDate:
        config.expirationDate !== undefined ? config.expirationDate : Config.DEFAULT_COMPONENTS_IDS.expirationDate,
      notificationFrame:
        config.notificationFrame !== undefined
          ? config.notificationFrame
          : Config.DEFAULT_COMPONENTS_IDS.notificationFrame,
      securityCode: config.securityCode !== undefined ? config.securityCode : Config.DEFAULT_COMPONENTS_IDS.securityCode
    };

    return {
      ...optionalIds,
      ...requiredIds
    };
  }

  private _setFieldsToSubmit(config: IConfig): { fieldsToSubmit: string[] } {
    return {
      fieldsToSubmit: config.fieldsToSubmit ? config.fieldsToSubmit : [...Config.DEFAULT_FIELDS_TO_SUBMIT]
    };
  }

  private _setPropertiesToSubmit(config: IConfig): { submitFields: string[] } {
    return {
      submitFields: config.submitFields !== undefined ? config.submitFields : Config.DEFAULT_SUBMIT_PROPERTIES
    };
  }

  private _setComponentsProperties(config: IConfig): IComponentsConfig {
    if (!config.components) {
      return {
        defaultPaymentType: '',
        paymentTypes: [''],
        requestTypes: [...Config.DEFAULT_COMPONENTS_REQUEST_TYPES],
        startOnLoad: false
      };
    }
    return {
      defaultPaymentType:
        config.components.defaultPaymentType !== undefined ? config.components.defaultPaymentType : '',
      paymentTypes: config.components.paymentTypes !== undefined ? config.components.paymentTypes : [''],
      requestTypes:
        config.components.requestTypes !== undefined
          ? config.components.requestTypes
          : [...Config.DEFAULT_COMPONENTS_REQUEST_TYPES],
      startOnLoad: config.components.startOnLoad !== undefined ? config.components.startOnLoad : false
    };
  }

  private _setApmConfig(apm: IWalletConfig | {}, components: IComponentsConfig): IWalletConfig {
    if (!apm) {
      return apm;
    }
    return {
      ...apm,
      requestTypes:
        components && components.requestTypes !== undefined
          ? components.requestTypes
          : [...Config.DEFAULT_APMS_REQUEST_TYPES]
    };
  }
}
