const applePayConfig = {
  button: {
    containerId: 'applePayContainerId',
    color: 'red'
  }
};

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI1YzEyODg0NWMxMWI5MjIwZGMwNDZlOGUiLCJpYXQiOjE1NTE3MDA2MDAsImp0aSI6IjQ2LWU4MTlkN2I1YzZlNTRlNDU1MDE0YmJlMjQzMTRhNDBkZGFlMmE0ZTcyNDFmYjQxN2MzOTk3NDdhNTBhZDc3NTciLCJwYXlsb2FkIjp7Ik9yZGVyRGV0YWlscyI6eyJBbW91bnQiOjEyMzk5LCJDdXJyZW5jeUNvZGUiOiI4MjYifX0sIk9yZ1VuaXRJZCI6IjVjMTEzZThlNmZlM2QxMjQ2MDE0MTg2OCJ9.Ed00YsroqvlWHuovtMXSnJ3nQtmF-S0QavdufescND8';

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
