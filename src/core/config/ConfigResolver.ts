import Joi from '@hapi/joi';
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

  public validate(config: IConfig | IComponentsConfig | IComponentsIds, schema: Joi.ObjectSchema) {
    const result = schema.validate(config);
    if (result.error) {
      throw result.error;
    }
  }

  public resolve(config: IConfig): IConfig {
    this.validate(config, ConfigSchema);
    return {
      analytics: this._isTruthy(config.analytics) ? config.analytics : false,
      animatedCard: this._isTruthy(config.animatedCard) ? config.animatedCard : false,
      applePay: this._setApmConfig(config.applePay, config.components),
      buttonId: this._isTruthy(config.buttonId) ? config.buttonId : '',
      bypassCards: this._isTruthy(config.bypassCards) ? config.bypassCards : [],
      cachetoken: this._isTruthy(config.cachetoken) ? config.cachetoken : '',
      componentIds: this._componentIds(config.componentIds),
      components: this._setComponentsProperties(config),
      datacenterurl: this._isTruthy(config.datacenterurl) ? config.datacenterurl : environment.GATEWAY_URL,
      deferInit: this._isTruthy(config.deferInit) ? config.deferInit : false,
      formId: this._isTruthy(config.formId) ? config.formId : Selectors.MERCHANT_FORM_SELECTOR,
      fieldsToSubmit: this._isTruthy(config.fieldsToSubmit) ? config.fieldsToSubmit : ['pan', 'expirydate', 'securitycode'],
      init: this._isTruthy(config.init) ? config.init : { cachetoken: '', threedinit: '' },
      jwt: this._isTruthy(config.jwt) ? config.jwt : '',
      livestatus: this._isTruthy(config.livestatus) ? config.livestatus : 0,
      origin: this._isTruthy(config.origin) ? config.origin : window.location.origin,
      panIcon: this._isTruthy(config.panIcon) ? config.panIcon : false,
      placeholders: this._isTruthy(config.placeholders) ? config.placeholders : {
        pan: '',
        expirydate: '',
        securitycode: ''
      },
      requestTypes: this._isTruthy(config.requestTypes) ?
        config.requestTypes : [],
      styles: this._isTruthy(config.styles) ? config.styles : {},
      submitCallback: this._isTruthy(config.submitCallback) ? config.submitCallback : null,
      submitFields: this._isTruthy(config.submitFields) ? config.submitFields : [],
      submitOnError: this._isTruthy(config.submitOnError) ? config.submitOnError : false,
      submitOnSuccess: this._isTruthy(config.submitOnSuccess) ? config.submitOnSuccess : false,
      threedinit: this._isTruthy(config.threedinit) ? config.threedinit : '',
      translations: this._isTruthy(config.translations) ? config.translations : {},
      visaCheckout: this._setApmConfig(config.visaCheckout, config.components),
      ...this._setFieldsToSubmit(config),
      ...this._setPropertiesToSubmit(config)
    };
  }

  private _isTruthy(value: any) {
    const valueType = typeof value;
    if (valueType === 'object') {
      if (value.length) {
        return true;
      } else {
        return Object.keys(value).length;
      }
    }

    return Boolean(value);
  }

  private _componentIds(config: IComponentsIds): IComponentsIds {
    if (!this._isTruthy(config)) {
      return { ...this.DEFAULT_COMPONENTS_IDS };
    }
    const optionalIds = {
      animatedCard: this._isTruthy(config.animatedCard) ? config.animatedCard : this.DEFAULT_COMPONENTS_IDS.animatedCard
    };
    const requiredIds = {
      cardNumber: this._isTruthy(config.cardNumber) ? config.cardNumber : this.DEFAULT_COMPONENTS_IDS.cardNumber,
      expirationDate: this._isTruthy(config.expirationDate)
        ? config.expirationDate
        : this.DEFAULT_COMPONENTS_IDS.expirationDate,
      notificationFrame: this._isTruthy(config.notificationFrame)
        ? config.notificationFrame
        : this.DEFAULT_COMPONENTS_IDS.notificationFrame,
      securityCode: this._isTruthy(config.securityCode) ? config.securityCode : this.DEFAULT_COMPONENTS_IDS.securityCode
    };
    return {
      ...optionalIds,
      ...requiredIds
    };
  }

  private _setFieldsToSubmit(config: IConfig): { fieldsToSubmit: string[] } {
    return {
      fieldsToSubmit: this._isTruthy(config.fieldsToSubmit) ? config.fieldsToSubmit : [...this.DEFAULT_FIELDS_TO_SUBMIT]
    };
  }

  private _setPropertiesToSubmit(config: IConfig): { submitFields: string[] } {
    return {
      submitFields: this._isTruthy(config.submitFields) ? config.submitFields : this.DEFAULT_SUBMIT_PROPERTIES
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
      defaultPaymentType: this._isTruthy(config.components.defaultPaymentType)
        ? config.components.defaultPaymentType
        : '',
      paymentTypes: this._isTruthy(config.components.paymentTypes) ? config.components.paymentTypes : [''],
      requestTypes: this._isTruthy(config.components.requestTypes)
        ? config.components.requestTypes
        : [...this.DEFAULT_COMPONENTS_REQUEST_TYPES],
      startOnLoad: this._isTruthy(config.components.startOnLoad) ? config.components.startOnLoad : false
    };
  }

  private _setApmConfig(apm: IWalletConfig | {}, components: IComponentsConfig): IWalletConfig {
    if (!apm) {
      return apm;
    }
    return {
      ...apm,
      requestTypes:
        components && this._isTruthy(components.requestTypes)
          ? components.requestTypes
          : [...this.DEFAULT_APMS_REQUEST_TYPES]
    };
  }
}
