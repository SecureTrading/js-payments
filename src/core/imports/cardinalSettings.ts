const applePayConfig = {
  button: {
    color: 'red',
    containerId: 'applePayContainerId'
  }
};

const loggingConfiguration = { logging: { level: 'on' } };

const paymentConfig = {
  displayLoading: false,
  framework: 'bootstrap3',
  view: 'modal'
};
const paypalConfig = {
  button: {
    color: 'gold',
    containerId: 'MySpecificPayPalId',
    shape: 'rect',
    size: '44px',
    style: 'paypal'
  },
  enableShippingAddress: false,
  flow: 'checkout',
  intent: 'order',
  offerCredit: false,
  shippingAddressEditable: true
};
const visaCheckoutConfig = {
  button: {
    color: '',
    containerId: 'MySpecificVisaCheckoutId',
    height: '',
    locale: '',
    size: '',
    width: ''
  }
};

export {
  applePayConfig,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
};
