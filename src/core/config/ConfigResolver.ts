import Joi from 'joi';
import { IConfig } from './model/IConfig';
import { Service } from 'typedi';
import { IComponentsIds } from './model/IComponentsIds';
import { Selectors } from '../shared/Selectors';
import { IComponentsConfig } from './model/IComponentsConfig';
import { environment } from '../../environments/environment';
import { IWalletConfig } from './model/IWalletConfig';
import { ConfigSchema } from './schema/ConfigSchema';

@Service()
export class ConfigResolver {
  private readonly DEFAULT_COMPONENTS_IDS: IComponentsIds = {
    animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
    cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
    expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
    notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
    securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
  };

  private readonly DEFAULT_APMS_REQUEST_TYPES: string[] = ['AUTH'];
  private readonly DEFAULT_COMPONENTS_REQUEST_TYPES: string[] = ['THREEDQUERY', 'AUTH'];
  private readonly DEFAULT_FIELDS_TO_SUBMIT: string[] = ['pan', 'expirydate', 'securitycode'];
  private readonly DEFAULT_SUBMIT_PROPERTIES: string[] = [
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
      ...this.resolve(config)
    };
  }

  public validate(config: IConfig | IComponentsConfig | IComponentsIds, schema: Joi.JoiObject) {
    Joi.validate(config, schema, (error, value) => {
      if (error !== null) {
        throw error;
      }
    });
  }

  public resolve(config: IConfig): IConfig {
    this.validate(config, ConfigSchema);
    return {
      analytics: config.analytics !== undefined ? config.analytics : false,
      animatedCard: config.animatedCard !== undefined ? config.animatedCard : false,
      applePay: this._setApmConfig(config.applePay, config.components),
      buttonId: config.buttonId !== undefined ? config.buttonId : '',
      bypassCards: config.bypassCards !== undefined ? config.bypassCards : [],
      componentIds: this._componentIds(config.componentIds),
      components: this._setComponentsProperties(config),
      datacenterurl: config.datacenterurl !== undefined ? config.datacenterurl : environment.GATEWAY_URL,
      deferInit: config.deferInit !== undefined ? config.deferInit : false,
      formId: config.formId !== undefined ? config.formId : Selectors.MERCHANT_FORM_SELECTOR,
      init: config.init !== undefined ? config.init : { cachetoken: '', threedinit: '' },
      jwt: config.jwt !== undefined ? config.jwt : '',
      livestatus: config.livestatus !== undefined ? config.livestatus : 0,
      origin: config.origin !== undefined ? config.origin : window.location.origin,
      panIcon: config.panIcon !== undefined ? config.panIcon : false,
      placeholders: config.placeholders || { pan: '', expirydate: '', securitycode: '' },
      styles: config.styles ? config.styles : {},
      submitCallback: config.submitCallback !== undefined ? config.submitCallback : null,
      submitFields: config.submitFields !== undefined ? config.submitFields : [],
      submitOnError: config.submitOnError !== undefined ? config.submitOnError : false,
      submitOnSuccess: config.submitOnSuccess !== undefined ? config.submitOnSuccess : true,
      translations: config.translations ? config.translations : {},
      visaCheckout: this._setApmConfig(config.visaCheckout, config.components),
      ...this._setFieldsToSubmit(config),
      ...this._setPropertiesToSubmit(config)
    };
  }

  private _componentIds(config: IComponentsIds): IComponentsIds {
    if (!config) {
      return { ...this.DEFAULT_COMPONENTS_IDS };
    }

    const optionalIds = config.animatedCard !== undefined ? { animatedCard: config.animatedCard } : {};
    const requiredIds = {
      cardNumber: config.cardNumber !== undefined ? config.cardNumber : this.DEFAULT_COMPONENTS_IDS.cardNumber,
      expirationDate:
        config.expirationDate !== undefined ? config.expirationDate : this.DEFAULT_COMPONENTS_IDS.expirationDate,
      notificationFrame:
        config.notificationFrame !== undefined
          ? config.notificationFrame
          : this.DEFAULT_COMPONENTS_IDS.notificationFrame,
      securityCode: config.securityCode !== undefined ? config.securityCode : this.DEFAULT_COMPONENTS_IDS.securityCode
    };

    return {
      ...optionalIds,
      ...requiredIds
    };
  }

  private _setFieldsToSubmit(config: IConfig): { fieldsToSubmit: string[] } {
    return {
      fieldsToSubmit: config.fieldsToSubmit ? config.fieldsToSubmit : [...this.DEFAULT_FIELDS_TO_SUBMIT]
    };
  }

  private _setPropertiesToSubmit(config: IConfig): { submitFields: string[] } {
    return {
      submitFields: config.submitFields !== undefined ? config.submitFields : this.DEFAULT_SUBMIT_PROPERTIES
    };
  }

  private _setComponentsProperties(config: IConfig): IComponentsConfig {
    if (!config.components) {
      return {
        defaultPaymentType: '',
        paymentTypes: [''],
        requestTypes: [...this.DEFAULT_COMPONENTS_REQUEST_TYPES],
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
          : [...this.DEFAULT_COMPONENTS_REQUEST_TYPES],
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
          : [...this.DEFAULT_APMS_REQUEST_TYPES]
    };
  }
}
