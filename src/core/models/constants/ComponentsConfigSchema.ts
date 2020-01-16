import Joi from 'joi';
export const ComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().allow([Joi.string()]),
  requestTypes: Joi.array().allow([Joi.string()]),
  startOnLoad: Joi.boolean()
});
