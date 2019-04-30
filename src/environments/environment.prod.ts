const GATEWAY_URL: string = 'https://webservices.securetrading.net/jwt/';
const MOCK_GATEWAY_URL: string = 'https://merchant.example.com:8443';

export const environment = {
  production: true,
  testEnvironment: false,
  FRAME_URL: '',
  GATEWAY_URL: GATEWAY_URL,
  CARDINAL_COMMERCE: {
    CONFIG: {
      logging: { level: 'off' }
    },
    SONGBIRD_URL: 'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js',
    MOCK: {
      AUTHENTICATE_CARD_URL: `${MOCK_GATEWAY_URL}/cardinalAuthenticateCard`
    }
  },
  VISA_CHECKOUT_URLS: {
    PROD_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    PROD_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  ST_URLS: {
    MOCK: {
      THREEDQUERY_URL: `${MOCK_GATEWAY_URL}/threeDQuery`
    }
  }
};
