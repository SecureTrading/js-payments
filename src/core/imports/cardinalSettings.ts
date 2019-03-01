const applePayConfig = {
  button: {
    containerId: 'applePayContainerId',
    color: 'red'
  }
};

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

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
