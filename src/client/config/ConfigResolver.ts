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
import { IPlaceholdersConfig } from '../../application/core/models/IPlaceholdersConfig';
import { DefaultPlaceholders } from '../../application/core/models/constants/config-resolver/DefaultPlaceholders';

@Service()
export class ConfigResolver {
  public resolve(config: IConfig): IConfig {
    ConfigResolver._validate(config, ConfigSchema);
    return {
      analytics: ConfigResolver._getValueOrDefault(config.analytics, DefaultConfig.analytics),
      animatedCard: ConfigResolver._getValueOrDefault(config.animatedCard, DefaultConfig.animatedCard),
      applePay: ConfigResolver._setApmConfig(config.applePay, DefaultConfig.applePay),
      buttonId: ConfigResolver._getValueOrDefault(config.buttonId, DefaultConfig.buttonId),
      bypassCards: ConfigResolver._getValueOrDefault(config.bypassCards, DefaultConfig.bypassCards),
      cachetoken: ConfigResolver._getValueOrDefault(config.cachetoken, DefaultConfig.cachetoken),
      componentIds: ConfigResolver._setComponentIds(config.componentIds),
      components: ConfigResolver._setComponentsProperties(config.components),
      cybertonicaApiKey: ConfigResolver._getValueOrDefault(config.cybertonicaApiKey, ''),
      datacenterurl: ConfigResolver._getValueOrDefault(config.datacenterurl, DefaultConfig.datacenterurl),
      deferInit: ConfigResolver._getValueOrDefault(config.deferInit, DefaultConfig.deferInit),
      disableNotification: ConfigResolver._getValueOrDefault(
        config.disableNotification,
        DefaultConfig.disableNotification
      ),
      errorCallback: ConfigResolver._getValueOrDefault(config.errorCallback, DefaultConfig.errorCallback),
      fieldsToSubmit: ConfigResolver._getValueOrDefault(config.fieldsToSubmit, DefaultConfig.fieldsToSubmit),
      formId: ConfigResolver._getValueOrDefault(config.formId, DefaultConfig.formId),
      init: ConfigResolver._getValueOrDefault(config.init, DefaultConfig.init),
      jwt: ConfigResolver._getValueOrDefault(config.jwt, DefaultConfig.jwt),
      livestatus: ConfigResolver._getValueOrDefault(config.livestatus, DefaultConfig.livestatus),
      origin: ConfigResolver._getValueOrDefault(config.origin, DefaultConfig.origin),
      panIcon: ConfigResolver._getValueOrDefault(config.panIcon, DefaultConfig.panIcon),
      placeholders: ConfigResolver._setPlaceholders(config.placeholders),
      requestTypes: ConfigResolver._getValueOrDefault(config.requestTypes, DefaultComponentsRequestTypes),
      styles: ConfigResolver._getValueOrDefault(config.styles, DefaultConfig.styles),
      submitCallback: ConfigResolver._getValueOrDefault(config.submitCallback, DefaultConfig.submitCallback),
      submitFields: ConfigResolver._getValueOrDefault(config.submitFields, DefaultSubmitFields),
      submitOnError: ConfigResolver._getValueOrDefault(config.submitOnError, DefaultConfig.submitOnError),
      submitOnSuccess: ConfigResolver._getValueOrDefault(config.submitOnSuccess, DefaultConfig.submitOnSuccess),
      successCallback: ConfigResolver._getValueOrDefault(config.successCallback, DefaultConfig.successCallback),
      threedinit: ConfigResolver._getValueOrDefault(config.threedinit, DefaultConfig.threedinit),
      translations: ConfigResolver._getValueOrDefault(config.translations, DefaultConfig.translations),
      visaCheckout: ConfigResolver._setApmConfig(config.visaCheckout, DefaultConfig.visaCheckout)
    };
  }

  private static _validate(
    config: IConfig | IComponentsConfig | IComponentsIds | IApplePay | IVisaCheckout,
    schema: Joi.ObjectSchema
  ): void {
    const { error } = schema.validate(config);

    if (error) {
      throw error;
    }
  }

  private static _getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
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

  private static _setApmConfig(
    config: IApplePay | IVisaCheckout | {},
    defaultConfig: {}
  ): IApplePay | IVisaCheckout | {} {
    if (!config || !Object.keys(config).length) {
      return defaultConfig;
    }
    return {
      ...config,
      // @ts-ignore
      requestTypes: ConfigResolver._getValueOrDefault(config.requestTypes, DefaultApmsRequestTypes)
    };
  }

  private static _setComponentIds(config: IComponentsIds): IComponentsIds {
    if (!config || !Object.keys(config).length) {
      return DefaultComponentsIds;
    }
    return {
      animatedCard: ConfigResolver._getValueOrDefault(config.animatedCard, DefaultComponentsIds.animatedCard),
      cardNumber: ConfigResolver._getValueOrDefault(config.cardNumber, DefaultComponentsIds.cardNumber),
      expirationDate: ConfigResolver._getValueOrDefault(config.expirationDate, DefaultComponentsIds.expirationDate),
      notificationFrame: ConfigResolver._getValueOrDefault(
        config.notificationFrame,
        DefaultComponentsIds.notificationFrame
      ),
      securityCode: ConfigResolver._getValueOrDefault(config.securityCode, DefaultComponentsIds.securityCode)
    };
  }

  private static _setComponentsProperties(config: IComponentsConfig): IComponentsConfig {
    if (!config || !Object.keys(config).length) {
      return DefaultComponents;
    }
    return {
      defaultPaymentType: ConfigResolver._getValueOrDefault(
        config.defaultPaymentType,
        DefaultComponents.defaultPaymentType
      ),
      paymentTypes: ConfigResolver._getValueOrDefault(config.paymentTypes, DefaultComponents.paymentTypes),
      requestTypes: ConfigResolver._getValueOrDefault(config.requestTypes, DefaultComponentsRequestTypes),
      startOnLoad: ConfigResolver._getValueOrDefault(config.startOnLoad, DefaultComponents.startOnLoad)
    };
  }

  private static _setPlaceholders(config: IPlaceholdersConfig): IPlaceholdersConfig {
    if (!config || !Object.keys(config).length) {
      return DefaultPlaceholders;
    }
    return {
      pan: ConfigResolver._getValueOrDefault(config.pan, DefaultPlaceholders.pan),
      expirydate: ConfigResolver._getValueOrDefault(config.expirydate, DefaultPlaceholders.expirydate),
      securitycode: ConfigResolver._getValueOrDefault(config.securitycode, DefaultPlaceholders.securitycode)
    };
  }
}
