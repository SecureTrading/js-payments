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
  FRAME_URL: '',
  GATEWAY_URL,
  ST_URLS: {
    MOCK: {
      THREEDQUERY_URL: `${MOCK_GATEWAY_URL}/threeDQuery`
    }
  },
  VISA_CHECKOUT_URLS: {
    PROD_BUTTON_URL: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png',
    PROD_SDK: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  },
  production: true,
  testEnvironment: false
};
