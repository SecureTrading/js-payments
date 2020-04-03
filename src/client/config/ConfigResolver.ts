import Joi from '@hapi/joi';
import { IConfig } from '../../shared/model/config/IConfig';
import { Service } from 'typedi';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { Selectors } from '../../application/core/shared/Selectors';
import { IComponentsConfig } from '../../shared/model/config/IComponentsConfig';
import { environment } from '../../environments/environment';
import { IWalletConfig } from '../../shared/model/config/IWalletConfig';
import { ConfigSchema } from './schema/ConfigSchema';
import { DefaultSubmitFields } from '../../application/core/models/constants/config-resolver/DefaultSubmitFields';
import { DefaultFieldsToSubmit } from '../../application/core/models/constants/config-resolver/DefaultFieldsToSubmit';
import { DefaultComponentsRequestTypes } from '../../application/core/models/constants/config-resolver/DefaultComponentsRequestTypes';
import { DefaultComponentsIds } from '../../application/core/models/constants/config-resolver/DefaultComponentsIds';
import { DefaultApmsRequestTypes } from '../../application/core/models/constants/config-resolver/DefaultApmsRequestTypes';
import { DefaultConfig } from '../../application/core/models/constants/config-resolver/DefaultConfig';
import { DefaultVisaCheckout } from '../../application/core/models/constants/config-resolver/DefaultVisaCheckout';
import { DefaultComponents } from '../../application/core/models/constants/config-resolver/DefaultComponents';

@Service()
export class ConfigResolver {
  public validate(config: IConfig | IComponentsConfig | IComponentsIds, schema: Joi.ObjectSchema): void {
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
      componentIds: this._componentIds(config.componentIds),
      components: this._setComponentsProperties(config),
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
      visaCheckout: this._setApmConfig(config.visaCheckout, DefaultVisaCheckout)
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

  private _setComponentsProperties(config: IConfig): IComponentsConfig {
    const { components } = config;
    if (!components) {
      return DefaultComponents;
    }
    const { defaultPaymentType, paymentTypes, requestTypes, startOnLoad } = components;
    return {
      defaultPaymentType: this._getValueOrDefault(defaultPaymentType, DefaultComponents.defaultPaymentType),
      paymentTypes: this._getValueOrDefault(paymentTypes, DefaultComponents.paymentTypes),
      requestTypes: this._getValueOrDefault(requestTypes, DefaultComponentsRequestTypes),
      startOnLoad: this._getValueOrDefault(startOnLoad, DefaultComponents.startOnLoad)
    };
  }

  private _setApmConfig(apm: IWalletConfig | {}, components: IComponentsConfig): IWalletConfig {
    if (!apm) {
      return apm;
    }
    return {
      ...apm,
      requestTypes: components && this._getValueOrDefault(components.requestTypes, DefaultApmsRequestTypes)
    };
  }
}
