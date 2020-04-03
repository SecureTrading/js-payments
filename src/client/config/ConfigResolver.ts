import Joi from '@hapi/joi';
import { IConfig } from '../../shared/model/config/IConfig';
import { Service } from 'typedi';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { IComponentsConfig } from '../../shared/model/config/IComponentsConfig';
import { ConfigSchema } from './schema/ConfigSchema';
import { DefaultSubmitFields } from '../../application/core/models/constants/config-resolver/DefaultSubmitFields';
import { DefaultComponentsRequestTypes } from '../../application/core/models/constants/config-resolver/DefaultComponentsRequestTypes';
import { DefaultComponentsIds } from '../../application/core/models/constants/config-resolver/DefaultComponentsIds';
import { DefaultApmsRequestTypes } from '../../application/core/models/constants/config-resolver/DefaultApmsRequestTypes';
import { DefaultConfig } from '../../application/core/models/constants/config-resolver/DefaultConfig';
import { DefaultComponents } from '../../application/core/models/constants/config-resolver/DefaultComponents';
import { IApplePay } from '../../application/core/models/IApplePay';
import { IVisaCheckout } from '../../application/core/models/constants/IVisaCheckout';

@Service()
export class ConfigResolver {
  public validate(
    config: IConfig | IComponentsConfig | IComponentsIds | IApplePay | IVisaCheckout,
    schema: Joi.ObjectSchema
  ): void {
    const { error } = schema.validate(config);

    if (error) {
      throw error;
    }
  }

  public resolve(config: IConfig): IConfig {
    this.validate(config, ConfigSchema);
    return {
      analytics: this._getValueOrDefault(config.analytics, DefaultConfig.analytics),
      animatedCard: this._getValueOrDefault(config.animatedCard, DefaultConfig.animatedCard),
      applePay: this._setApmConfig(config.applePay, DefaultConfig.applePay),
      buttonId: this._getValueOrDefault(config.buttonId, DefaultConfig.buttonId),
      bypassCards: this._getValueOrDefault(config.bypassCards, DefaultConfig.bypassCards),
      cachetoken: this._getValueOrDefault(config.cachetoken, DefaultConfig.cachetoken),
      componentIds: this._setComponentIds(config.componentIds),
      components: this._setComponentsProperties(config.components),
      datacenterurl: this._getValueOrDefault(config.datacenterurl, DefaultConfig.datacenterurl),
      deferInit: this._getValueOrDefault(config.deferInit, DefaultConfig.deferInit),
      disableNotification: this._getValueOrDefault(config.disableNotification, DefaultConfig.disableNotification),
      fieldsToSubmit: this._getValueOrDefault(config.fieldsToSubmit, DefaultConfig.fieldsToSubmit),
      formId: this._getValueOrDefault(config.formId, DefaultConfig.formId),
      init: this._getValueOrDefault(config.init, DefaultConfig.init),
      jwt: this._getValueOrDefault(config.jwt, DefaultConfig.jwt),
      livestatus: this._getValueOrDefault(config.livestatus, DefaultConfig.livestatus),
      origin: this._getValueOrDefault(config.origin, DefaultConfig.origin),
      panIcon: this._getValueOrDefault(config.panIcon, DefaultConfig.panIcon),
      placeholders: this._getValueOrDefault(config.placeholders, DefaultConfig.placeholders),
      requestTypes: this._getValueOrDefault(config.requestTypes, DefaultComponentsRequestTypes),
      styles: this._getValueOrDefault(config.styles, DefaultConfig.styles),
      submitCallback: this._getValueOrDefault(config.submitCallback, DefaultConfig.submitCallback),
      successCallback: this._getValueOrDefault(config.successCallback, DefaultConfig.successCallback),
      errorCallback: this._getValueOrDefault(config.errorCallback, DefaultConfig.errorCallback),
      submitFields: this._getValueOrDefault(config.submitFields, DefaultSubmitFields),
      submitOnError: this._getValueOrDefault(config.submitOnError, DefaultConfig.submitOnError),
      submitOnSuccess: this._getValueOrDefault(config.submitOnSuccess, DefaultConfig.submitOnSuccess),
      threedinit: this._getValueOrDefault(config.threedinit, DefaultConfig.threedinit),
      translations: this._getValueOrDefault(config.translations, DefaultConfig.translations),
      visaCheckout: this._setApmConfig(config.visaCheckout, DefaultConfig.visaCheckout)
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

  private _setApmConfig(config: IApplePay | IVisaCheckout | {}, defaultConfig: {}): IApplePay | IVisaCheckout | {} {
    if (!config) {
      return defaultConfig;
    }

    // @ts-ignore
    if (config.requestTypes) {
      return {
        ...config,
        // @ts-ignore
        requestTypes: this._getValueOrDefault(config.requestTypes, DefaultApmsRequestTypes)
      };
    }

    return config;
  }

  private _setComponentIds(config: IComponentsIds): IComponentsIds {
    if (!config) {
      return DefaultComponentsIds;
    }
    const optionalIds = {
      animatedCard: this._getValueOrDefault(config.animatedCard, DefaultComponentsIds.animatedCard)
    };
    const requiredIds = {
      cardNumber: this._getValueOrDefault(config.cardNumber, DefaultComponentsIds.cardNumber),
      expirationDate: this._getValueOrDefault(config.expirationDate, DefaultComponentsIds.expirationDate),
      notificationFrame: this._getValueOrDefault(config.notificationFrame, DefaultComponentsIds.notificationFrame),
      securityCode: this._getValueOrDefault(config.securityCode, DefaultComponentsIds.securityCode)
    };
    return {
      ...optionalIds,
      ...requiredIds
    };
  }

  private _setComponentsProperties(config: IComponentsConfig): IComponentsConfig {
    if (!config) {
      return DefaultComponents;
    }
    const { defaultPaymentType, paymentTypes, requestTypes, startOnLoad } = config;
    return {
      defaultPaymentType: this._getValueOrDefault(defaultPaymentType, DefaultComponents.defaultPaymentType),
      paymentTypes: this._getValueOrDefault(paymentTypes, DefaultComponents.paymentTypes),
      requestTypes: this._getValueOrDefault(requestTypes, DefaultComponentsRequestTypes),
      startOnLoad: this._getValueOrDefault(startOnLoad, DefaultComponents.startOnLoad)
    };
  }
}
