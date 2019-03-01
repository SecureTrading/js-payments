const applePayConfig = {
  button: {
    containerId: 'applePayContainerId',
    color: 'red'
  }
};

const jwt = {
  jti: 'a5a59bfb-ac06-4c5f-be5c-351b64ae608e',
  iat: 1448997865,
  iss: '56560a358b946e0c8452365ds',
  OrgUnitId: '565607c18b946e058463ds8r',
  Payload: {
    OrderDetails: {
      OrderNumber: '0e5c5bf2-ea64-42e8-9ee1-71fff6522e15',
      Amount: '1500',
      CurrencyCode: '840'
    }
  },
  ObjectifyPayload: true,
  ReferenceId: 'c88b20c0-5047-11e6-8c35-8789b865ff15',
  exp: 1449001465,
  ConfirmUrl: 'https://securetrading.com/confirmHandler'
};

const loggingConfiguration = { logging: { level: 'on' } };

const paymentConfig = {
  view: 'modal',
  framework: 'bootstrap3',
  displayLoading: false
};
const paypalConfig = {
  button: {
    containerId: 'MySpecificPayPalId',
    color: 'gold',
    shape: 'rect',
    style: 'paypal',
    size: '44px'
  },
  flow: 'checkout',
  intent: 'order',
  offerCredit: false,
  enableShippingAddress: false,
  shippingAddressEditable: true
};
const visaCheckoutConfig = {
  button: {
    containerId: 'MySpecificVisaCheckoutId',
    color: '',
    size: '',
    height: '',
    width: '',
    locale: ''
  }
};

export {
  applePayConfig,
  jwt,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
};
