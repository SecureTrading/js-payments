declare const WEBSERVICES_URL: string;

const GATEWAY_URL: string = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL: string = 'https://merchant.example.com:8443';

export const environment = {
  APM_NAMES: {
    APPLE_PAY: 'APPLEPAY',
    VISA_CHECKOUT: 'VISACHECKOUT'
  },
  APPLE_PAY_URLS: {
    MOCK_DATA_URL: 'https://merchant.example.com:8443/applePaymentStatus'
  },
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'on' }
    },
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_GATEWAY_URL}/cardinalAuthenticateCard`
    },
    SONGBIRD_LIVE_URL: 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js',
    SONGBIRD_TEST_URL: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js'
  },
  CARDINAL_COMMERCE_CONFIG: {
    logging: { level: 'on' }
  },
  // @ts-ignore
  FRAME_URL: WEBSERVICES_URL,
  GATEWAY_URL,
  GA_MEASUREMENT_ID: '42057093-5',
  GA_SCRIPT_SRC: 'https://www.google-analytics.com/analytics_debug.js',
  NOTIFICATION_TTL: 7000,
  VISA_CHECKOUT_URLS: {
    LIVE_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    LIVE_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    MOCK_DATA_URL: `${MOCK_GATEWAY_URL}/visaPaymentStatus`,
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  CYBERTONICA: {
    CYBERTONICA_LIVE_URL: 'https://cyber.securetrading.net/js/v2/afeasdwqwdasd.js'
  },
  production: false,
  testEnvironment: false,
  overrideDomain: '',
  SENTRY_DSN: null as string,
  SENTRY_WHITELIST_URLS: ['https://webservices.securetrading.net']
};
