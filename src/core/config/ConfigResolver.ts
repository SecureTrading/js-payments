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
      analytics: this._getValueOrDefault(config.analytics, false),
      animatedCard: this._getValueOrDefault(config.animatedCard, false),
      applePay: this._setApmConfig(config.applePay, config.components),
      buttonId: this._getValueOrDefault(config.buttonId, ''),
      bypassCards: this._getValueOrDefault(config.bypassCards, []),
      componentIds: this._componentIds(config.componentIds),
      components: this._setComponentsProperties(config),
      datacenterurl: this._getValueOrDefault(config.datacenterurl, environment.GATEWAY_URL),
      deferInit: this._getValueOrDefault(config.deferInit, false),
      fieldsToSubmit: this._getValueOrDefault(config.fieldsToSubmit, [...this.DEFAULT_FIELDS_TO_SUBMIT]),
      formId: this._getValueOrDefault(config.formId, Selectors.MERCHANT_FORM_SELECTOR),
      init: this._getValueOrDefault(config.init, { cachetoken: '', threedinit: '' }),
      jwt: this._getValueOrDefault(config.jwt, ''),
      livestatus: this._getValueOrDefault(config.livestatus, 0),
      // Can't use isTruthy for notifications because we default to true so undefined wants to act as if it's truthy
      notifications: config.notifications !== undefined ? config.notifications : true,
      origin: this._getValueOrDefault(config.origin, window.location.origin),
      panIcon: this._getValueOrDefault(config.panIcon, false),
      placeholders: this._getValueOrDefault(config.placeholders, {
        pan: '',
        expirydate: '',
        securitycode: ''
      }),
      styles: this._getValueOrDefault(config.styles, {}),
      submitCallback: this._getValueOrDefault(config.submitCallback, null),
      submitFields: this._getValueOrDefault(config.submitFields, this.DEFAULT_SUBMIT_PROPERTIES),
      submitOnError: this._getValueOrDefault(config.submitOnError, false),
      // Can't use isTruthy for submitOnSuccess because we default to true so undefined wants to act as if it's truthy
      submitOnSuccess: config.submitOnSuccess !== undefined ? config.submitOnSuccess : true,
      translations: this._getValueOrDefault(config.translations, {}),
      visaCheckout: this._setApmConfig(config.visaCheckout, config.components)
    };
  }

  private _getValueOrDefault(value: any, defaultValue: any) {
    const valueType = typeof value;
    if (valueType === 'object' && (Boolean(value.length) || Boolean(Object.keys(value).length))) {
      return value;
    } else if (Boolean(value)) {
      return value;
    } else {
      return defaultValue;
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
      notificationFrame: this._getValueOrDefault(config.notificationFrame,
        this.DEFAULT_COMPONENTS_IDS.notificationFrame),
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
        requestTypes: [...this.DEFAULT_COMPONENTS_REQUEST_TYPES],
        startOnLoad: false
      };
    }

    return {
      defaultPaymentType: this._getValueOrDefault(components.defaultPaymentType, ''),
      paymentTypes: this._getValueOrDefault(components.paymentTypes, ['']),
      requestTypes: this._getValueOrDefault(components.requestTypes, [...this.DEFAULT_COMPONENTS_REQUEST_TYPES]),
      startOnLoad: this._getValueOrDefault(components.startOnLoad, false)
    };
  }

  private _setApmConfig(apm: IWalletConfig | {}, components: IComponentsConfig): IWalletConfig {
    if (!apm) {
      return apm;
    }
    return {
      ...apm,
      requestTypes:
        components && this._getValueOrDefault(components.requestTypes, [...this.DEFAULT_APMS_REQUEST_TYPES])
    };
  }
}
