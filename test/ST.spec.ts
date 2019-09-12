import ApplePay from '../src/core/integrations/ApplePay';
import ApplePayMock from '../src/core/integrations/ApplePayMock';
import CardinalCommerceMock from '../src/core/integrations/CardinalCommerceMock';
import { CardinalCommerce } from '../src/core/integrations/CardinalCommerce';
import VisaCheckout from '../src/core/integrations/VisaCheckout';
import VisaCheckoutMock from '../src/core/integrations/VisaCheckoutMock';
import Selectors from '../src/core/shared/Selectors';
import { environment } from '../src/environments/environment';
import ST from './../src/ST';

window.alert = jest.fn();

jest.mock('./../src/core/shared/DomMethods');
jest.mock('./../src/core/classes/CommonFrames.class');
jest.mock('./../src/core/classes/CardFrames.class');
jest.mock('./../src/core/integrations/CardinalCommerce');
jest.mock('./../src/core/integrations/CardinalCommerceMock');
jest.mock('./../src/core/integrations/VisaCheckout');
jest.mock('./../src/core/integrations/VisaCheckoutMock');
jest.mock('./../src/core/integrations/ApplePay');
jest.mock('./../src/core/integrations/ApplePayMock');
jest.mock('./../src/core/integrations/GoogleAnalytics');

// given
describe('ST', () => {
  const { config, cacheConfig, instance } = stFixture();
  // given
  describe('constructor()', () => {
    let stObject: any;
    // when
    beforeEach(() => {
      stObject = ST(cacheConfig);
    });
    // then
    it(`should set threedinit if it's configured in config object`, () => {
      expect(stObject._threedinit).toEqual(cacheConfig.init.threedinit);
    });
    // then
    it(`should set cachetoken if it's configured in config object`, () => {
      expect(stObject._cachetoken).toEqual(cacheConfig.init.cachetoken);
    });
  });

  // given
  describe('ST.Components()', () => {
    const { instance } = stFixture();

    // when
    beforeEach(() => {
      instance.CardinalCommerce = jest.fn();
      instance.Components();
    });

    // then
    it('should call CardinalCommerce method', () => {
      expect(instance.CardinalCommerce).toHaveBeenCalled();
    });
  });

  // given
  describe('ST.ApplePay()', () => {
    const { instance, applePayConfig } = stFixture();

    // then
    it('should return VisaCheckoutMock object when environment.testEnvironment equals true', () => {
      environment.testEnvironment = true;
      expect(instance.ApplePay(applePayConfig, config.jwt)).toBeInstanceOf(ApplePayMock);
    });
    // then
    it('should return VisaCheckout object when environment.testEnvironment equals false', () => {
      environment.testEnvironment = false;
      expect(instance.ApplePay(applePayConfig, config.jwt)).toBeInstanceOf(ApplePay);
    });
  });

  // given
  describe('ST.VisaCheckout()', () => {
    const { visaCheckoutConfig } = stFixture();
    // then
    it('should return VisaCheckoutMock object when environment.testEnvironment equals true', () => {
      environment.testEnvironment = true;
      expect(instance.VisaCheckout(visaCheckoutConfig, config.jwt)).toBeInstanceOf(VisaCheckoutMock);
    });
    // then
    it('should return VisaCheckout object when environment.testEnvironment equals false', () => {
      environment.testEnvironment = false;
      expect(instance.VisaCheckout(visaCheckoutConfig, config.jwt)).toBeInstanceOf(VisaCheckout);
    });
  });

  // given
  describe('ST.CardinalCommerce()', () => {
    //when
    const {
      config: { jwt }
    } = stFixture();
    // then
    it('should return CardinalCommerceMock when environment.testEnvironment equals true', () => {
      environment.testEnvironment = true;
      expect(instance.CardinalCommerce(false, jwt, ['AUTH', 'JSINIT'])).toBeInstanceOf(CardinalCommerceMock);
    });

    // then
    it('should return CardinalCommerce when environment.testEnvironment equals false', () => {
      environment.testEnvironment = false;
      expect(instance.CardinalCommerce(false, jwt, ['AUTH', 'JSINIT'])).toBeInstanceOf(CardinalCommerce);
    });
  });

  // given
  describe('ST._setClassProperties()', () => {
    // then
    it('should set all settings properly', () => {
      instance._setClassProperties(config);
      expect(instance._jwt).toEqual(config.jwt);
    });

    // then
    it('should set cachetoken when init is set', () => {
      instance._setClassProperties(cacheConfig);
      expect(instance._submitOnSuccess).toEqual(false);
    });

    // then
    it(`should set formId and _gatewayUrl if they're specified in config`, () => {
      instance._setClassProperties(cacheConfig);
      expect(instance._gatewayUrl).toEqual(cacheConfig.datacenterurl);
      expect(Selectors.MERCHANT_FORM_SELECTOR).toEqual(cacheConfig.formId);
    });

    // then
    it(`should set default formId if they're not specified in config`, () => {
      instance._setClassProperties(config);
      expect(instance._gatewayUrl).toEqual(environment.GATEWAY_URL);
      expect(Selectors.MERCHANT_FORM_SELECTOR).toEqual(Selectors.MERCHANT_FORM_SELECTOR);
    });
  });
});

function stFixture() {
  document.body.innerHTML =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  const translations = {
    Timeout: 'Limit czasu',
    'Field is required': 'Pole jest wymagane',
    'An error occurred': 'Wystąpił błąd',
    'Merchant validation failure': 'Błąd weryfikacji sprzedawcy',
    'Payment has been cancelled': 'Płatność została anulowana',
    'Value mismatch pattern': 'Błędny format',
    'Invalid response': 'Niepoprawna odpowiedź',
    'Invalid request': 'Nieprawidłowe żądanie',
    'Value is too short': 'Wartość jest za krótka',
    'Payment has been authorized': 'Płatność została autoryzowana',
    'Amount and currency are not set': 'Kwota i waluta nie są ustawione',
    'Payment has been successfully processed': 'Płatność została pomyślnie przetworzona',
    'Card number': 'Numer karty',
    'Expiration date': 'Data ważności',
    'Security code': 'Kod bezpieczeństwa',
    Ok: 'Płatność została pomyślnie przetworzona',
    'Method not implemented': 'Metoda nie została zaimplementowana',
    'Form is not valid': 'Formularz jest nieprawidłowy',
    Pay: 'Zapłać',
    Processing: 'Przetwarzanie',
    'Invalid field': 'Nieprawidłowe pole',
    'Card number is invalid': 'Numer karty jest nieprawidłowy'
  };
  const config = {
    analytics: true,
    animatedCard: true,
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU2MDk0NjM4Ny4yNDIzMzQ0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMCIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.UssdRcocpaeAqd-jDXpxWeWiKIX-W7zlpy0UWrDE5vg', // Can't use property shorthand because it isn't supported by IE
    origin: 'https://someorigin.com',
    styles: {
      cardNumber: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      expirationDate: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      securityCode: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      }
    },
    submitOnError: false,
    submitOnSuccess: false,
    translations: { ...translations }
  };

  const cacheConfig = {
    animatedCard: true,
    jwt: config.jwt,
    init: {
      threedinit:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJSZWZlcmVuY2VJZCI6IjQyLWYzYThjNDk0YWNkYzY2MDcyOTc4YzY0ODg4ZWY5Mjk4ZDE4YWE1ZDRkMzUwNjBmZTQzNmFmN2M1YzI1NDVhM2QiLCJpc3MiOiI1YzEyODg0NWMxMWI5MjIwZGMwNDZlOGUiLCJqdGkiOiI0Mi1mM2E4YzQ5NGFjZGM2NjA3Mjk3OGM2NDg4OGVmOTI5OGQxOGFhNWQ0ZDM1MDYwZmU0MzZhZjdjNWMyNTQ1YTNkIiwiaWF0IjoxNTYxNzI2ODA5LCJQYXlsb2FkIjp7Ik9yZGVyRGV0YWlscyI6eyJBbW91bnQiOjEwMDAsIkN1cnJlbmN5Q29kZSI6IjgyNiJ9fSwiT3JnVW5pdElkIjoiNWMxMTNlOGU2ZmUzZDEyNDYwMTQxODY4In0.GIpwP_MWbocwOkexF_AE1Bo0LuIYsXWFcKWog4EaygA',
      cachetoken:
        'eyJkYXRhY2VudGVydXJsIjogbnVsbCwgImNhY2hldG9rZW4iOiAiNDItZjNhOGM0OTRhY2RjNjYwNzI5NzhjNjQ4ODhlZjkyOThkMThhYTVkNGQzNTA2MGZlNDM2YWY3YzVjMjU0NWEzZCJ9'
    },
    origin: 'https://someorigin.com',
    styles: config.styles,
    submitOnError: false,
    submitOnSuccess: false,
    datacenterurl: 'https://example.com',
    formId: 'example-form',
    translations: { ...translations }
  };
  const applePayConfig = {
    buttonStyle: 'white-outline',
    buttonText: 'donate',
    merchantId: 'merchant.net.securetrading',
    paymentRequest: {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      total: {
        label: 'Secure Trading Merchant',
        amount: '10.00'
      }
    },
    placement: 'st-apple-pay'
  };

  const visaCheckoutConfig = {
    buttonSettings: {
      size: '154',
      color: 'neutral'
    },
    livestatus: 0,
    merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
    paymentRequest: {
      subtotal: '20.00'
    },
    placement: 'st-visa-checkout',
    settings: {
      displayName: 'My Test Site'
    }
  };
  const instance: any = ST(config);
  return { cacheConfig, config, instance, applePayConfig, visaCheckoutConfig };
}
