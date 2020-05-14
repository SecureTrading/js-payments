import Joi from '@hapi/joi';

export const ComponentsSchema = Joi.object().keys({
  defaultPaymentType: Joi.string().allow(''),
  requestTypes: Joi.array().items(
    Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
  ),
  paymentTypes: Joi.array().items(Joi.string().allow('')),
  startOnLoad: Joi.boolean().allow('')
});
