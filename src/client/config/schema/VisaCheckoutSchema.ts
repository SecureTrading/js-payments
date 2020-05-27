import Joi from '@hapi/joi';

export const VisaCheckoutSchema: Joi.ObjectSchema = Joi.object().keys({
  buttonSettings: Joi.object().keys({
    color: Joi.string().allow('neutral', 'standard'),
    size: Joi.number(),
    height: Joi.number().allow(34, 47, 94),
    width: Joi.number(),
    locale: Joi.string(),
    cardBrands: Joi.string().allow('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'ELECTRON', 'ELO'),
    acceptCanadianVisaDebit: Joi.string().allow('true', 'false'),
    cobrand: Joi.string()
  }),
  livestatus: Joi.number().valid(0, 1),
  merchantId: Joi.string(),
  paymentRequest: Joi.object().keys({
    merchantRequestId: Joi.string(),
    currencyCode: Joi.string(),
    subtotal: Joi.string(),
    shippingHandling: Joi.string(),
    tax: Joi.string(),
    discount: Joi.string(),
    giftWrap: Joi.string(),
    misc: Joi.string(),
    total: Joi.string(),
    orderId: Joi.string(),
    description: Joi.string(),
    promoCode: Joi.string(),
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
});
