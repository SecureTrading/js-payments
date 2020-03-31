import Joi from '@hapi/joi';

export const ComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  requestTypes: Joi.array().items(Joi.string().valid('THREEDQUERY', 'AUTH')),
  paymentTypes: Joi.array().items(Joi.string()),
  startOnLoad: Joi.boolean()
});
