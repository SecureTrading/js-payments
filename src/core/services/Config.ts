import Joi from 'joi';
import { IComponentsConfig, IComponentsConfigSchema, IComponentsIds, IConfig } from '../models/Config';
import Selectors from '../shared/Selectors';

export class Config {
  private static DEFAULT_COMPONENTS_IDS: IComponentsIds = {
    animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
    cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
    expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
    notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
    securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
  };

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

  public init(config: IConfig) {
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
      buttonId: config.buttonId !== undefined ? config.buttonId : '',
      byPassCards: config.byPassCards !== undefined ? config.byPassCards : [],
      componentIds: this._componentIds(config.componentIds),
      datacenterurl: config.datacenterurl !== undefined ? config.datacenterurl : '',
      deferInit: config.deferInit !== undefined ? config.deferInit : false,
      formId: config.formId !== undefined ? config.formId : '',
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
      ...this._setComponents(config),
      ...this._setFieldsToSubmit(config),
      ...this._setPropertiesToSubmit(config)
    };
  }

  private _componentIds(config: IComponentsIds): IComponentsIds | {} {
    if (!config) {
      return {};
    }
    this.validate(config, IComponentsConfigSchema);
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
      fieldsToSubmit: config.fieldsToSubmit ? config.fieldsToSubmit : ['pan', 'expirydate', 'securitycode']
    };
  }

  private _setPropertiesToSubmit(config: IConfig): { submitFields: string[] } {
    return {
      submitFields: config.submitFields !== undefined ? config.submitFields : Config.DEFAULT_SUBMIT_PROPERTIES
    };
  }

  private _setComponents(config: IConfig): IComponentsConfig {
    return {
      ...config.components,
      requestTypes:
        config.components.requestTypes !== undefined ? config.components.requestTypes : ['THREEDQUERY', 'AUTH'],
      startOnLoad: config.components.startOnLoad !== undefined ? config.components.startOnLoad : false
    };
  }
}
