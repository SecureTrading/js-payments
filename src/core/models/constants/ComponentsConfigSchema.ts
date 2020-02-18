import Joi from 'joi';
export const ComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  requestTypes: Joi.array().items(Joi.string().valid('THREEDQUERY', 'AUTH')),
  paymentTypes: Joi.array().allow(Joi.string()),
  startOnLoad: Joi.boolean()
});
