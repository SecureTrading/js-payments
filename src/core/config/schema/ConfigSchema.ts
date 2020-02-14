import Joi from 'joi';

export const ConfigSchema: Joi.JoiObject = Joi.object().keys({
  analytics: Joi.boolean(),
  animatedCard: Joi.boolean(),
  applePay: {
    buttonStyle: Joi.string(),
    buttonText: Joi.string(),
    merchantId: Joi.string(),
    requestTypes: Joi.array().allow([Joi.string()]),
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
  bypassCards: Joi.array().allow(
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
    },
    requestTypes: Joi.array().allow([Joi.string()]),
  }
});
