import Joi from 'joi';
import { IStyles } from '../shared/Styler';

interface IConfig {
  componentIds?: any;
  datacenterurl?: string;
  formId?: string;
  jwt: string;
  init: IByPassInit;
  origin?: string;
  styles?: IStyles;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  tokenise?: boolean;
}

interface IComponentsConfig {
  defaultPaymentType: string;
  paymentTypes?: string[];
  startOnLoad?: boolean;
}

interface IWalletConfig {
  [key: string]: any;
}

interface IByPassInit {
  threedinit: string;
  cachetoken: string;
}

const IConfigSchema: Joi.JoiObject = Joi.object().keys({
  cachetoken: Joi.string(),
  componentIds: Joi.object().keys({
    animatedCard: Joi.string().required(),
    cardNumber: Joi.string().required(),
    expirationDate: Joi.string().required(),
    notificationFrame: Joi.string().required(),
    securityCode: Joi.string().required()
  }),
  datacenterurl: Joi.string(),
  formId: Joi.string(),
  jwt: Joi.string().required(),
  origin: Joi.string(),
  styles: Joi.object(),
  submitFields: Joi.array().allow([Joi.string()]),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  threedinit: Joi.string(),
  tokenise: Joi.boolean()
});

const IComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});

export { IByPassInit, IConfig, IConfigSchema, IComponentsConfig, IComponentsConfigSchema, IWalletConfig };
