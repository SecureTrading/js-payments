const GATEWAY_URL: string = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL: string = 'https://merchant.example.com:8443';

export const environment = {
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'off' }
    },
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_GATEWAY_URL}/cardinalAuthenticateCard`
    },
    SONGBIRD_URL: 'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js'
  },
  FRAME_URL: 'https://webservices.securetrading.net/js',
  GATEWAY_URL,
  NOTIFICATION_TTL: 7000,
  VISA_CHECKOUT_URLS: {
    LIVE_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    LIVE_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  production: true,
  testEnvironment: false
};
