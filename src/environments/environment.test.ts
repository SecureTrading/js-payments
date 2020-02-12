// TODO should be webservices.securetrading.net but messageBus is blocking something
const FRAME_URL: string = 'https://merchant.example.com:8443';
const MOCK_GATEWAY_URL: string = 'https://webservices.securetrading.net:8443';
const GATEWAY_URL: string = `${MOCK_GATEWAY_URL}/jwt/`;
const MOCK_THIRD_PARTY_URL: string = 'https://thirdparty.example.com:8443';

export const environment = {
  APPLE_PAY_URLS: {
    MOCK_DATA_URL: `${MOCK_THIRD_PARTY_URL}/applePaymentStatus`
  },
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'on' }
    },
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_THIRD_PARTY_URL}/cardinalAuthenticateCard`
    },
    SONGBIRD_LIVE_URL: 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js',
    SONGBIRD_TEST_URL: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js'
  },
  FRAME_URL,
  GATEWAY_URL,
  GA_MEASUREMENT_ID: '42057093-5',
  GA_SCRIPT_SRC: 'https://www.google-analytics.com/analytics_debug.js',
  NOTIFICATION_TTL: 14000,
  VISA_CHECKOUT_URLS: {
    MOCK_DATA_URL: `${MOCK_THIRD_PARTY_URL}/visaPaymentStatus`,
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  production: false,
  testEnvironment: true
};
