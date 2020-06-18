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
    SONGBIRD_LIVE_URL: 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js',
    SONGBIRD_TEST_URL: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js'
  },
  FRAME_URL: 'https://webservices.securetrading.net/js/v2',
  GATEWAY_URL,
  GA_MEASUREMENT_ID: '42057093-6',
  GA_SCRIPT_SRC: 'https://www.google-analytics.com/analytics.js',
  NOTIFICATION_TTL: 7000,
  VISA_CHECKOUT_URLS: {
    LIVE_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    LIVE_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  CYBERTONICA: {
    CYBERTONICA_LIVE_URL: 'https://cyber.securetrading.net/js/v2/afeasdwqwdasd.js'
  },
  production: true,
  testEnvironment: false,
  overrideDomain: '',
  SENTRY_DSN: 'https://6319b9ff1fb14ba48cd2c9025d67bd2d@o402164.ingest.sentry.io/5262818',
  SENTRY_WHITELIST_URLS: ['https://webservices.securetrading.net']
};
