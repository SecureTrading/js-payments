const GATEWAY_URL: string = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL: string = 'https://merchant.example.com:8443';

export const environment = {
  production: false,
  testEnvironment: false,
  FRAME_URL: 'http://localhost:8080',
  GATEWAY_URL: GATEWAY_URL,
  APM_NAMES: {
    APPLE_PAY: 'APPLEPAY',
    VISA_CHECKOUT: 'VISACHECKOUT'
  },
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'on' }
    },
    SONGBIRD_URL: 'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js',
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_GATEWAY_URL}/cardinalAuthenticateCard`
    }
  },
  VISA_CHECKOUT_URLS: {
    DEV_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    DEV_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    PROD_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    PROD_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    MOCK_DATA_URL: `${MOCK_GATEWAY_URL}/visaPaymentStatus`
  }
};
