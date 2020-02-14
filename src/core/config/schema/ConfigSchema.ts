import Joi from 'joi';

export const ConfigSchema: Joi.JoiObject = Joi.object().keys({
  analytics: Joi.boolean(),
  animatedCard: Joi.boolean(),
  applePay: {
    buttonStyle: Joi.string().allow('black', 'white', 'white-outline'),
    buttonText: Joi.string().allow('plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'),
    merchantId: Joi.string(),
    requestTypes: Joi.array().allow([Joi.string()]),
    paymentRequest: {
      countryCode: Joi.string(),
      currencyCode: Joi.string(),
      merchantCapabilities: Joi.array().allow('supports3DS', 'supportsCredit', 'supportsDebit', 'supportsEMV'),
      supportedNetworks: Joi.array().allow(
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
      ),
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
  components: {
    defaultPaymentType: Joi.string(),
    requestTypes: Joi.array().allow('THREEDQUERY', 'AUTH'),
    paymentTypes: Joi.array().allow(Joi.string()),
    startOnLoad: Joi.boolean()
  },
  datacenterurl: Joi.string(),
  deferInit: Joi.boolean(),
  fieldsToSubmit: Joi.array().allow('pan', 'expirydate', 'securitycode'),
  formId: Joi.string(),
  init: {
    cachetoken: Joi.string(),
    threedinit: Joi.string()
  },
  jwt: Joi.string().required(),
  livestatus: Joi.number().allow(0, 1),
  origin: Joi.string(),
  requestTypes: Joi.array().allow('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY'),
  styles: Joi.object(),
  submitCallback: Joi.any(),
  submitFields: Joi.array().allow(
    'baseamount',
    'currencyiso3a',
    'eci',
    'enrolled',
    'errorcode',
    'errordata',
    'errormessage',
    'orderreference',
    'settlestatus',
    'status',
    'transactionreference'
  ),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  threedinit: Joi.string(),
  translations: Joi.object(),
  visaCheckout: {
    buttonSettings: {
      color: Joi.string(),
      size: Joi.string()
    },
    livestatus: Joi.number().allow(0, 1),
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
