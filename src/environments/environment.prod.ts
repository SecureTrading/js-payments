export const environment = {
  production: true,
  testEnvironment: false,
  FRAME_URL: 'https://webservices.securetrading.net/js',
  GATEWAY_URL: 'https://webservices.securetrading.net/jwt/',
  SONGBIRD_URL: 'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js',
  CARDINAL_COMMERCE_CONFIG: {
    logging: { level: 'off'}
  },
  APM_NAMES: {
    APPLE_PAY: 'APPLEPAY',
    VISA_CHECKOUT: 'VISACHECKOUT'
  },
  VISA_CHECKOUT_URLS: {
    PROD_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    PROD_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    DEV_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    DEV_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  }
};
