const applePayConfig = {
  button: {
    containerId: 'applePayContainerId',
    color: 'red'
  }
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
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
};
