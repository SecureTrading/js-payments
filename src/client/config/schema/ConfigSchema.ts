import Joi from '@hapi/joi';

export const ConfigSchema: Joi.ObjectSchema = Joi.object().keys({
  analytics: Joi.boolean(),
  animatedCard: Joi.boolean(),
  applePay: {
    buttonStyle: Joi.string().valid('black', 'white', 'white-outline'),
    buttonText: Joi.string().valid('plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'),
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
      }
    },
    placement: Joi.string()
  },
  buttonId: Joi.string(),
  bypassCards: Joi.array().items(
    Joi.string().valid('AMEX', 'ASTROPAYCARD', 'DINERS', 'DISCOVER', 'JCB', 'MASTERCARD', 'MAESTRO', 'PIBA', 'VISA')
  ),
  cachetoken: Joi.string(),
  cancelCallback: Joi.any(),
  componentIds: Joi.object()
    .keys({
      animatedCard: Joi.string().default('st-animated-card'),
      cardNumber: Joi.string().default('st-card-number'),
      expirationDate: Joi.string().default('st-expiration-date'),
      notificationFrame: Joi.string().default('st-notification-frame'),
      securityCode: Joi.string().default('st-security-code')
    })
    .allow({})
    .default({}),
  components: Joi.object()
    .keys({
      defaultPaymentType: Joi.string(),
      requestTypes: Joi.array().items(
        Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
      ),
      paymentTypes: Joi.array().items(Joi.string()),
      startOnLoad: Joi.boolean()
    })
    .default({}),
  datacenterurl: Joi.string(),
  deferInit: Joi.boolean(),
  disableNotification: Joi.boolean().default(false),
  errorCallback: Joi.any(),
  fieldsToSubmit: Joi.array().items(Joi.string().valid('pan', 'expirydate', 'securitycode')),
  formId: Joi.string(),
  init: Joi.object()
    .keys({
      cachetoken: Joi.string(),
      threedinit: Joi.string()
    })
    .allow(null),
  jwt: Joi.string().required(),
  livestatus: Joi.number().valid(0, 1),
  origin: Joi.string(),
  requestTypes: Joi.array().items(
    Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
  ),
  panIcon: Joi.boolean(),
  placeholders: Joi.object().keys({
    pan: Joi.string().allow(''),
    securitycode: Joi.string().allow(''),
    expirydate: Joi.string().allow('')
  }),
  styles: Joi.object(),
  submitCallback: Joi.any(),
  successCallback: Joi.any(),
  submitFields: Joi.array(),
  submitOnCancel: Joi.boolean(),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  threedinit: Joi.string(),
  translations: Joi.object(),
  visaCheckout: {
    buttonSettings: {
      color: Joi.string(),
      size: Joi.string()
    },
    livestatus: Joi.number().valid(0, 1),
    merchantId: Joi.string(),
    paymentRequest: {
      subtotal: Joi.string()
    },
    placement: Joi.string(),
    requestTypes: Joi.array().items(
      Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
    ),
    settings: {
      displayName: Joi.string()
    }
  }
});
