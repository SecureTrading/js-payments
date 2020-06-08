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
import { environment } from '../../environments/environment';

@Service()
export class ConfigResolver {
  public resolve(config: IConfig): IConfig {
    this._validate(config, ConfigSchema);
    const validatedConfig: IConfig = {
      analytics: this._getValueOrDefault(config.analytics, DefaultConfig.analytics),
      animatedCard: this._getValueOrDefault(config.animatedCard, DefaultConfig.animatedCard),
      applePay: this._setApplePayConfig(config.applePay, DefaultConfig.applePay),
      buttonId: this._getValueOrDefault(config.buttonId, DefaultConfig.buttonId),
      bypassCards: this._getValueOrDefault(config.bypassCards, DefaultConfig.bypassCards),
      cancelCallback: this._getValueOrDefault(config.cancelCallback, DefaultConfig.cancelCallback),
      componentIds: this._setComponentIds(config.componentIds),
      components: this._setComponentsProperties(config.components),
      cybertonicaApiKey: this._resolveCybertonicaApiKey(config.cybertonicaApiKey),
      datacenterurl: this._getValueOrDefault(config.datacenterurl, DefaultConfig.datacenterurl),
      deferInit: this._getValueOrDefault(config.deferInit, DefaultConfig.deferInit),
      disableNotification: this._getValueOrDefault(config.disableNotification, DefaultConfig.disableNotification),
      errorCallback: this._getValueOrDefault(config.errorCallback, DefaultConfig.errorCallback),
      errorReporting: this._getValueOrDefault(config.errorReporting, DefaultConfig.errorReporting),
      fieldsToSubmit: this._getValueOrDefault(config.fieldsToSubmit, DefaultConfig.fieldsToSubmit),
      formId: this._getValueOrDefault(config.formId, DefaultConfig.formId),
      init: this._getValueOrDefault(config.init, DefaultConfig.init),
      jwt: this._getValueOrDefault(config.jwt, DefaultConfig.jwt),
      livestatus: this._getValueOrDefault(config.livestatus, DefaultConfig.livestatus),
      origin: this._getValueOrDefault(config.origin, DefaultConfig.origin),
      panIcon: this._getValueOrDefault(config.panIcon, DefaultConfig.panIcon),
      placeholders: this._setPlaceholders(config.placeholders),
      styles: this._getValueOrDefault(config.styles, DefaultConfig.styles),
      submitCallback: this._getValueOrDefault(config.submitCallback, DefaultConfig.submitCallback),
      submitFields: this._getValueOrDefault(config.submitFields, DefaultSubmitFields),
      submitOnCancel: this._getValueOrDefault(config.submitOnCancel, false),
      submitOnError: this._getValueOrDefault(config.submitOnError, DefaultConfig.submitOnError),
      submitOnSuccess: this._getValueOrDefault(config.submitOnSuccess, DefaultConfig.submitOnSuccess),
      successCallback: this._getValueOrDefault(config.successCallback, DefaultConfig.successCallback),
      translations: this._getValueOrDefault(config.translations, DefaultConfig.translations),
      visaCheckout: this._setVisaCheckoutConfig(config.visaCheckout, DefaultConfig.visaCheckout)
    };
    if (!environment.production) {
      console.error(validatedConfig);
    }
    return validatedConfig;
  }

  private _validate(
    config: IConfig | IComponentsConfig | IComponentsIds | IApplePay | IVisaCheckout,
    schema: Joi.ObjectSchema
  ): void {
    const { error } = schema.validate(config);

    if (error) {
      throw error;
    }
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

  private _setVisaCheckoutConfig(config: IVisaCheckout | {}, defaultConfig: {}): IVisaCheckout | {} {
    if (!config || !Object.keys(config).length) {
      return defaultConfig;
    }
    return {
      ...config,
      // @ts-ignore
      requestTypes: this._getValueOrDefault(config.requestTypes, DefaultApmsRequestTypes)
    };
  }

  private _setApplePayConfig(config: IApplePay | {}, defaultConfig: {}): IApplePay | {} {
    if (!config || !Object.keys(config).length) {
      return defaultConfig;
    }

    // @ts-ignore
    config.paymentRequest.requestTypes = this._getValueOrDefault(
      // @ts-ignore
      config.paymentRequest.requestTypes,
      DefaultApmsRequestTypes
    );
    return {
      ...config
    };
  }

  private _setComponentIds(config: IComponentsIds): IComponentsIds {
    if (!config || !Object.keys(config).length) {
      return DefaultComponentsIds;
    }
    return {
      animatedCard: this._getValueOrDefault(config.animatedCard, DefaultComponentsIds.animatedCard),
      cardNumber: this._getValueOrDefault(config.cardNumber, DefaultComponentsIds.cardNumber),
      expirationDate: this._getValueOrDefault(config.expirationDate, DefaultComponentsIds.expirationDate),
      notificationFrame: this._getValueOrDefault(config.notificationFrame, DefaultComponentsIds.notificationFrame),
      securityCode: this._getValueOrDefault(config.securityCode, DefaultComponentsIds.securityCode)
    };
  }

  private _setComponentsProperties(config: IComponentsConfig): IComponentsConfig {
    if (!config || !Object.keys(config).length) {
      return DefaultComponents;
    }
    return {
      defaultPaymentType: this._getValueOrDefault(config.defaultPaymentType, DefaultComponents.defaultPaymentType),
      paymentTypes: this._getValueOrDefault(config.paymentTypes, DefaultComponents.paymentTypes),
      requestTypes: this._getValueOrDefault(config.requestTypes, DefaultComponentsRequestTypes),
      startOnLoad: this._getValueOrDefault(config.startOnLoad, DefaultComponents.startOnLoad)
    };
  }

  private _setPlaceholders(config: IPlaceholdersConfig): IPlaceholdersConfig {
    if (!config || !Object.keys(config).length) {
      return DefaultPlaceholders;
    }
    return {
      pan: this._getValueOrDefault(config.pan, DefaultPlaceholders.pan),
      expirydate: this._getValueOrDefault(config.expirydate, DefaultPlaceholders.expirydate),
      securitycode: this._getValueOrDefault(config.securitycode, DefaultPlaceholders.securitycode)
    };
  }

  private _resolveCybertonicaApiKey(value: string): string {
    if (value === '') {
      return '';
    }

    return this._getValueOrDefault(value, DefaultConfig.cybertonicaApiKey);
  }
}
