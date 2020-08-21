import Joi from '@hapi/joi';

export const ConfigSchema: Joi.ObjectSchema = Joi.object().keys({
  analytics: Joi.boolean(),
  animatedCard: Joi.boolean(),
  applePay: {
    buttonStyle: Joi.string().valid('black', 'white', 'white-outline'),
    buttonText: Joi.string().valid('plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'),
    merchantId: Joi.string(),
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
      requestTypes: Joi.array().items(Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'RISKDEC', 'SUBSCRIPTION'))
    },
    placement: Joi.string()
  },
  buttonId: Joi.string().allow(''),
  bypassCards: Joi.array().items(
    Joi.string().valid('AMEX', 'ASTROPAYCARD', 'DINERS', 'DISCOVER', 'JCB', 'MASTERCARD', 'MAESTRO', 'PIBA', 'VISA')
  ),
  cancelCallback: Joi.any(),
  componentIds: Joi.object()
    .keys({
      animatedCard: Joi.string().allow('').default('st-animated-card'),
      cardNumber: Joi.string().allow('').default('st-card-number'),
      expirationDate: Joi.string().allow('').default('st-expiration-date'),
      notificationFrame: Joi.string().allow('').default('st-notification-frame'),
      securityCode: Joi.string().allow('').default('st-security-code')
    })
    .allow({})
    .default({}),
  components: Joi.object()
    .keys({
      defaultPaymentType: Joi.string().allow(''),
      requestTypes: Joi.array().items(
        Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'JSINIT', 'RISKDEC', 'SUBSCRIPTION', 'THREEDQUERY')
      ),
      paymentTypes: Joi.array().items(Joi.string().allow('')),
      startOnLoad: Joi.boolean().allow('')
    })
    .default({}),
  cybertonicaApiKey: Joi.string().allow(''),
  datacenterurl: Joi.string().allow(''),
  deferInit: Joi.boolean(),
  disableNotification: Joi.boolean().default(false),
  errorCallback: Joi.any(),
  errorReporting: Joi.boolean(),
  fieldsToSubmit: Joi.array().items(Joi.string().valid('pan', 'expirydate', 'securitycode')),
  formId: Joi.string(),
  init: Joi.object()
    .keys({
      cachetoken: Joi.string().allow(''),
      threedinit: Joi.string().allow('')
    })
    .allow(null),
  jwt: Joi.string().required(),
  livestatus: Joi.number().valid(0, 1),
  origin: Joi.string().allow(''),
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
  translations: Joi.object(),
  visaCheckout: {
    buttonSettings: Joi.object().keys({
      color: Joi.string().allow('neutral', 'standard'),
      size: Joi.number(),
      height: Joi.number(),
      width: Joi.number(),
      locale: Joi.string(),
      cardBrands: Joi.string(),
      acceptCanadianVisaDebit: Joi.string(),
      cobrand: Joi.string()
    }),
    livestatus: Joi.number().valid(0, 1),
    merchantId: Joi.string(),
    paymentRequest: Joi.object().keys({
      merchantRequestId: Joi.string().allow(''),
      currencyCode: Joi.string().allow(''),
      subtotal: Joi.string().allow(''),
      shippingHandling: Joi.string().allow(''),
      tax: Joi.string().allow(''),
      discount: Joi.string().allow(''),
      giftWrap: Joi.string().allow(''),
      misc: Joi.string().allow(''),
      total: Joi.string().allow(''),
      orderId: Joi.string().allow(''),
      description: Joi.string().allow(''),
      promoCode: Joi.string().allow(''),
      customData: Joi.any()
    }),
    placement: Joi.string(),
    requestTypes: Joi.array().items(Joi.string().valid('ACCOUNTCHECK', 'AUTH', 'RISKDEC', 'SUBSCRIPTION')),
    settings: Joi.object().keys({
      locale: Joi.string(),
      countryCode: Joi.string(),
      displayName: Joi.string(),
      websiteUrl: Joi.string(),
      customerSupportUrl: Joi.string(),
      enableUserDataPrefill: Joi.boolean(),
      shipping: Joi.object().keys({
        acceptedRegions: Joi.array(),
        collectShipping: Joi.string().allow('true', 'false')
      }),
      payment: Joi.object().keys({
        cardBrands: Joi.array(),
        acceptCanadianVisaDebit: Joi.string().allow('true', 'false'),
        billingCountries: Joi.array()
      }),
      review: Joi.object().keys({
        message: Joi.string(),
        buttonAction: Joi.string()
      }),
      threeDSSetup: Joi.object().keys({
        threeDSActive: Joi.string().allow('true', 'false'),
        threeDSSuppressChallenge: Joi.string().allow('true', 'false')
      }),
      dataLevel: Joi.string()
    })
  }
});
