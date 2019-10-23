import Joi from 'joi';
import { IStyles } from '../shared/Styler';

interface IConfig {
  analytics?: boolean;
  animatedCard: boolean;
  buttonId?: string;
  componentIds?: any;
  datacenterurl?: string;
  deferInit?: boolean;
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
  buttonId: Joi.string(),
  cachetoken: Joi.string(),
  componentIds: Joi.object().keys({
    animatedCard: Joi.string(),
    cardNumber: Joi.string().required(),
    expirationDate: Joi.string().required(),
    notificationFrame: Joi.string().required(),
    securityCode: Joi.string().required()
  }),
  datacenterurl: Joi.string(),
  deferInit: Joi.boolean(),
  formId: Joi.string(),
  init: Joi.object(),
  jwt: Joi.string().required(),
  livestatus: Joi.number(),
  origin: Joi.string(),
  requestTypes: Joi.array().allow([Joi.string()]),
  styles: Joi.object(),
  submitCallback: Joi.func(),
  submitFields: Joi.array().allow([Joi.string()]),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  threedinit: Joi.string(),
  translations: Joi.object()
});

const IComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  requestTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});

export { IByPassInit, IConfig, IConfigSchema, IComponentsConfig, IComponentsConfigSchema, IWalletConfig };
