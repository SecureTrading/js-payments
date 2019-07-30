import Joi from 'joi';
import { IStyles } from '../shared/Styler';

interface IConfig {
  animatedCard?: boolean;
  componentIds?: any;
  datacenterurl?: string;
  formId?: string;
  jwt: string;
  init?: IByPassInit;
  origin?: string;
  styles?: IStyles;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
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
  animatedCard: Joi.boolean(),
  cachetoken: Joi.string(),
  componentIds: Joi.object().keys({
    animatedCard: Joi.string(),
    cardNumber: Joi.string().required(),
    expirationDate: Joi.string().required(),
    notificationFrame: Joi.string().required(),
    securityCode: Joi.string().required()
  }),
  datacenterurl: Joi.string(),
  formId: Joi.string(),
  init: Joi.object(),
  jwt: Joi.string().required(),
  origin: Joi.string(),
  requestTypes: Joi.array().allow([Joi.string()]),
  styles: Joi.object(),
  submitFields: Joi.array().allow([Joi.string()]),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  threedinit: Joi.string()
});

const IComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  requestTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});

export { IByPassInit, IConfig, IConfigSchema, IComponentsConfig, IComponentsConfigSchema, IWalletConfig };
