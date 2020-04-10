import Joi from '@hapi/joi';
import { IConfig } from '../../shared/model/config/IConfig';
import { Service } from 'typedi';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { Selectors } from '../../application/core/shared/Selectors';
import { IComponentsConfig } from '../../shared/model/config/IComponentsConfig';
import { environment } from '../../environments/environment';
import { IWalletConfig } from '../../shared/model/config/IWalletConfig';
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

  public validate(config: IConfig | IComponentsConfig | IComponentsIds, schema: Joi.ObjectSchema) {
    const { error } = schema.validate(config);

    if (error) {
      throw error;
    }
  }

  public resolve(config: IConfig): IConfig {
    this.validate(config, ConfigSchema);
    return {
      analytics: this._getValueOrDefault(config.analytics, false),
      animatedCard: this._getValueOrDefault(config.animatedCard, false),
      applePay: this._setApmConfig(config.applePay, config.components),
      buttonId: this._getValueOrDefault(config.buttonId, ''),
      bypassCards: this._getValueOrDefault(config.bypassCards, []),
      cachetoken: this._getValueOrDefault(config.cachetoken, ''),
      componentIds: this._componentIds(config.componentIds),
      components: this._setComponentsProperties(config),
      datacenterurl: this._getValueOrDefault(config.datacenterurl, environment.GATEWAY_URL),
      deferInit: this._getValueOrDefault(config.deferInit, false),
      disableNotification: this._getValueOrDefault(config.disableNotification, false),
      fieldsToSubmit: this._getValueOrDefault(config.fieldsToSubmit, [...this.DEFAULT_FIELDS_TO_SUBMIT]),
      formId: this._getValueOrDefault(config.formId, Selectors.MERCHANT_FORM_SELECTOR),
      init: this._getValueOrDefault(config.init, { cachetoken: '', threedinit: '' }),
      jwt: this._getValueOrDefault(config.jwt, ''),
      livestatus: this._getValueOrDefault(config.livestatus, 0),
      origin: this._getValueOrDefault(config.origin, window.location.origin),
      panIcon: this._getValueOrDefault(config.panIcon, false),
      placeholders: this._getValueOrDefault(config.placeholders, {
        pan: '',
        expirydate: '',
        securitycode: ''
      }),
      requestTypes: this._getValueOrDefault(config.requestTypes, [...this.DEFAULT_COMPONENTS_REQUEST_TYPES]),
      styles: this._getValueOrDefault(config.styles, {}),
      submitCallback: this._getValueOrDefault(config.submitCallback, null),
      successCallback: this._getValueOrDefault(config.successCallback, null),
      errorCallback: this._getValueOrDefault(config.errorCallback, null),
      submitFields: this._getValueOrDefault(config.submitFields, this.DEFAULT_SUBMIT_PROPERTIES),
      submitOnError: this._getValueOrDefault(config.submitOnError, false),
      submitOnSuccess: this._getValueOrDefault(config.submitOnSuccess, true),
      threedinit: this._getValueOrDefault(config.threedinit, ''),
      translations: this._getValueOrDefault(config.translations, {}),
      visaCheckout: this._setApmConfig(config.visaCheckout, config.components)
    };
  }

  private _getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
    switch (typeof value) {
      case 'undefined':
        return defaultValue;
      case 'string':
        return value.length ? value : defaultValue;
      case 'number':
        return Number.isFinite(value) ? value : defaultValue;
      case 'boolean':
        return value;
      case 'object':
        if (value === null) {
          return defaultValue;
        }
        if (Array.isArray(value)) {
          return value.length ? value : defaultValue;
        }
        return Object.keys(value).length ? value : defaultValue;
      default:
        return Boolean(value) ? value : defaultValue;
    }
  }

  private _componentIds(config: IComponentsIds): IComponentsIds {
    if (!config) {
      return { ...this.DEFAULT_COMPONENTS_IDS };
    }
    const optionalIds = {
      animatedCard: this._getValueOrDefault(config.animatedCard, this.DEFAULT_COMPONENTS_IDS.animatedCard)
    };
    const requiredIds = {
      cardNumber: this._getValueOrDefault(config.cardNumber, this.DEFAULT_COMPONENTS_IDS.cardNumber),
      expirationDate: this._getValueOrDefault(config.expirationDate, this.DEFAULT_COMPONENTS_IDS.expirationDate),
      notificationFrame: this._getValueOrDefault(
        config.notificationFrame,
        this.DEFAULT_COMPONENTS_IDS.notificationFrame
      ),
      securityCode: this._getValueOrDefault(config.securityCode, this.DEFAULT_COMPONENTS_IDS.securityCode)
    };
    return {
      ...optionalIds,
      ...requiredIds
    };
  }

  private _setComponentsProperties(config: IConfig): IComponentsConfig {
    const { components } = config;
    if (!components) {
      return {
        defaultPaymentType: '',
        paymentTypes: [''],
        requestTypes: this.DEFAULT_COMPONENTS_REQUEST_TYPES,
        startOnLoad: false
      };
    }
    return {
      defaultPaymentType: this._getValueOrDefault(components.defaultPaymentType, ''),
      paymentTypes: this._getValueOrDefault(components.paymentTypes, ['']),
      requestTypes: this._getValueOrDefault(components.requestTypes, this.DEFAULT_COMPONENTS_REQUEST_TYPES),
      startOnLoad: this._getValueOrDefault(components.startOnLoad, false)
    };
  }

  private _setApmConfig(apm: IWalletConfig, components: IComponentsConfig): IWalletConfig {
    if (!apm) {
      return apm;
    }
    return {
      ...apm,
      requestTypes: components && this._getValueOrDefault(apm.requestTypes, this.DEFAULT_APMS_REQUEST_TYPES)
    };
  }
}
