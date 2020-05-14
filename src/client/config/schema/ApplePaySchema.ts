import Joi from '@hapi/joi';

export const ApplePaySchema = Joi.object().keys({
  buttonStyle: Joi.string().valid('black', 'white', 'white-outline'),
  buttonText: Joi.string().valid('plain', 'buy', 'book', 'donate', 'check-out', 'subscribe', 'set-up'),
  merchantId: Joi.string(),
  requestTypes: Joi.array().items(
    Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
  ),
  paymentRequest: {
    countryCode: Joi.string(),
    currencyCode: Joi.string(),
    merchantCapabilities: Joi.array().items(
      Joi.string().valid('supports3DS', 'supportsCredit', 'supportsDebit', 'supportsEMV')
    ),
    supportedNetworks: Joi.array().items(
      Joi.string().valid(
        'amex',
        'chinaUnionPay',
        'discover',
        'interac',
        'jcb',
        'masterCard',
        'privateLabel',
        'visa',
        'cartesBancaires',
        'eftpos',
        'electron',
        'maestro',
        'vPay',
        'elo',
        'mada'
      )
    ),
    total: {
      amount: Joi.string(),
      label: Joi.string()
    },
    requiredBillingContactFields: Joi.array().items(Joi.string()),
    requiredShippingContactFields: Joi.array().items(Joi.string()),
    requestTypes: Joi.array().items(
      Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
    )
  },
  placement: Joi.string()
});
