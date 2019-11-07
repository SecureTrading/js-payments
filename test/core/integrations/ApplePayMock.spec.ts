import ApplePayMock from '../../../src/core/integrations/ApplePayMock';
import ApplePaySessionMock from '../../../src/core/integrations/ApplePaySessionMock';

// given
describe('Class ApplePayMock', () => {
  // given
  describe('ApplePayMock.ifApplePayIsAvailable', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should always return true', () => {
      expect(instance.ifApplePayIsAvailable()).toBe(true);
    });
  });

  // given
  describe('ApplePayMock.setApplePayVersion', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should always set version to 5', () => {
      instance.setApplePayVersion();
      expect(instance.applePayVersion).toBe(5);
    });
  });

  // given
  describe('ApplePayMock.isUserLoggedToAppleAccount', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should always return true', () => {
      expect(instance.isUserLoggedToAppleAccount()).toBe(true);
    });
  });

  // given
  describe('ApplePayMock.checkApplePayWalletCardAvailability', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should return promise which returns true', () => {
      instance.checkApplePayWalletCardAvailability().then((response: boolean) => {
        expect(response).toBe(true);
      });
    });
  });

  // given
  describe('ApplePayMock.getApplePaySessionObject', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should always return mock applepay session', () => {
      expect(instance.getApplePaySessionObject()).toBe(ApplePaySessionMock);
    });
  });

  // given
  describe('ApplePayMock.getApplePaySessionObject', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should always return STATUS_SUCCESS as SUCCESS', () => {
      ApplePaySessionMock.STATUS_SUCCESS = 'SUCCESS';
      ApplePaySessionMock.STATUS_FAILURE = 'ERROR';
      expect(instance.getPaymentSuccessStatus()).toBe('SUCCESS');
    });

    // then
    it('should always return STATUS_SUCCESS as ERROR', () => {
      ApplePaySessionMock.STATUS_SUCCESS = 'SUCCESS';
      ApplePaySessionMock.STATUS_FAILURE = 'ERROR';
      expect(instance.getPaymentFailureStatus()).toBe('ERROR');
    });
  });

  // given
  describe('ApplePayMock.createApplePayButton', () => {
    // when
    let instance: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
    });

    // then
    it('should always return Mock button', () => {
      expect(instance.createApplePayButton().tagName).toBe('IMG');
      expect(instance.createApplePayButton().id).toBe('st-apple-pay');
    });
  });
});

function applePayMockFixture() {
  const config = {
    paymentRequest: {
      total: { label: 'Secure Trading Merchant', amount: '10.00' },
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      supportedNetworks: ['amex', 'visa']
    },
    merchantId: 'merchant.net.securetrading',
    placement: 'st-apple-pay',
    buttonText: 'donate',
    buttonStyle: 'white-outline'
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const instance = new ApplePayMock(config, jwt, 'https://example.com');
  return { instance, config, jwt };
}
