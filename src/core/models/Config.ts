import Joi from 'joi';
import { IStyles } from './Styler';

enum ByPassCards {
  AMEX = 'AMEX',
  ASTROPAYCARD = 'ASTROPAYCARD',
  DINERS = 'DINERS',
  DISCOVER = 'DISCOVER',
  JCB = 'JCB',
  MASTERCARD = 'MASTERCARD',
  MAESTRO = 'MAESTRO',
  PIBA = 'PIBA',
  VISA = 'VISA'
}

interface IComponentsIds {
  animatedCard?: string;
  cardNumber: string;
  expirationDate: string;
  notificationFrame: string;
  securityCode: string;
}

interface IConfig {
  analytics?: boolean;
  animatedCard?: boolean;
  applePay?: IWalletConfig;
  byPassCards?: ByPassCards[];
  buttonId?: string;
  components?: IComponentsConfig;
  componentIds?: IComponentsIds | {};
  datacenterurl?: string;
  deferInit?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  jwt: string;
  init?: IByPassInit;
  livestatus?: number;
  origin?: string;
  styles?: IStyles;
  submitCallback?: any;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  translations?: {};
  visaCheckout?: IWalletConfig;
}

interface IComponentsConfig {
  defaultPaymentType: string;
  paymentTypes?: string[];
  startOnLoad?: boolean;
  requestTypes?: string[];
}

interface IWalletConfig {
  [key: string]: any;
  requestTypes?: string[];
}

interface IByPassInit {
  threedinit: string;
  cachetoken: string;
}

const IConfigSchema: Joi.JoiObject = Joi.object().keys({
  analytics: Joi.boolean(),
  animatedCard: Joi.boolean(),
  applePay: {
    buttonStyle: Joi.string(),
    buttonText: Joi.string(),
    merchantId: Joi.string(),
    paymentRequest: {
      countryCode: Joi.string(),
      currencyCode: Joi.string(),
      merchantCapabilities: Joi.array(),
      supportedNetworks: Joi.array(),
      total: {
        amount: Joi.string(),
        label: Joi.string()
      }
    },
    placement: Joi.string()
  },
  buttonId: Joi.string(),
  byPassCards: Joi.array().allow(
    'AMEX',
    'ASTROPAYCARD',
    'DINERS',
    'DISCOVER',
    'JCB',
    'MASTERCARD',
    'MAESTRO',
    'PIBA',
    'VISA'
  ),
  cachetoken: Joi.string(),
  componentIds: Joi.object().keys({
    animatedCard: Joi.string(),
    cardNumber: Joi.string().required(),
    expirationDate: Joi.string().required(),
    notificationFrame: Joi.string().required(),
    securityCode: Joi.string().required()
  }),
  components: Joi.object(),
  datacenterurl: Joi.string(),
  deferInit: Joi.boolean(),
  fieldsToSubmit: Joi.array().allow('pan', 'expirydate', 'securitycode'),
  formId: Joi.string(),
  init: Joi.object(),
  jwt: Joi.string().required(),
  livestatus: Joi.number(),
  origin: Joi.string(),
  requestTypes: Joi.array().allow([Joi.string()]),
  styles: Joi.object(),
  submitCallback: Joi.any(),
  submitFields: Joi.array().allow([Joi.string()]),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  threedinit: Joi.string(),
  translations: Joi.object(),
  visaCheckout: {
    buttonSettings: {
      color: Joi.string(),
      size: Joi.string()
    },
    livestatus: Joi.number(),
    merchantId: Joi.string(),
    paymentRequest: {
      subtotal: Joi.string()
    },
    placement: Joi.string(),
    settings: {
      displayName: Joi.string()
    }
  }
});

const IComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  requestTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});

export { IByPassInit, IConfig, IComponentsConfig, IComponentsConfigSchema, IWalletConfig, ByPassCards, IComponentsIds };
