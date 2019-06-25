import Joi from 'joi';
import { IStyles } from '../shared/Styler';

interface IConfig {
  componentIds?: any;
  datacenterurl?: string;
  formId?: string;
  jwt: string;
  jwtOnInit?: string;
  merchantCacheToken?: string;
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

const IConfigSchema: Joi.JoiObject = Joi.object().keys({
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
  jwtOnInit: Joi.string(),
  merchantCacheToken: Joi.string(),
  origin: Joi.string(),
  styles: Joi.object(),
  submitFields: Joi.array().allow([Joi.string()]),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  tokenise: Joi.boolean()
});

const IComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});

export { IConfig, IConfigSchema, IComponentsConfig, IComponentsConfigSchema, IWalletConfig };
