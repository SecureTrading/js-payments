const GATEWAY_URL: string = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL: string = 'https://merchant.example.com:8443';

export const environment = {
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
    SONGBIRD_URL: 'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js'
  },
  // @ts-ignore
  FRAME_URL: `https://${HOST}:8443`,
  GATEWAY_URL,
  NOTIFICATION_TTL: 14000,
  ST_URLS: {
    MOCK: {
      AUTH: `${MOCK_GATEWAY_URL}/auth`,
      THREEDQUERY_URL: `${MOCK_GATEWAY_URL}/threeDQuery`
    }
  },
  VISA_CHECKOUT_URLS: {
    MOCK_DATA_URL: `${MOCK_GATEWAY_URL}/visaPaymentStatus`,
    TEST_BUTTON_URL: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png',
    TEST_SDK: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  production: false,
  testEnvironment: true
};
