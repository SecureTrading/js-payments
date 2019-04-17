import Selectors from '../../../src/core/shared/Selectors';
import ApplePay from './../../../src/core/classes/ApplePay.class';

// given
describe('Class Apple Pay', () => {
  // given
  describe('On init', () => {
    // then
    it('should set instance with proper settings', () => {
      // const t = Selectors.NOTIFICATION_FRAME_IFRAME;
      // @ts-ignore
      // global.window.frames[Selectors.NOTIFICATION_FRAME_IFRAME] = window.frames[Selectors.NOTIFICATION_FRAME_IFRAME];
      const { instance } = ApplePayFixture();
      expect(instance).toBeTruthy();
    });
  });

  // given
  describe('Method ifApplePayIsAvailable', () => {
    // then
    it('should return undefined if device is not Mac', () => {
      // const { instance } = ApplePayFixture();
      // // @ts-ignore
      // global.window = window;
      // expect(instance.ifApplePayIsAvailable()).toBeFalsy();
    });
  });

  // given
  describe('Method ifBrowserSupportsApplePayVersion', () => {
    // then
    it('should return undefined if device is not Mac', () => {
      // const { instance } = ApplePayFixture();
      // expect(instance.ifBrowserSupportsApplePayVersion(3)).toBeFalsy();
    });
  });

  // given
  describe('Method setApplePayVersion', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method setSupportedNetworks', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method setApplePayButtonProps', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method createApplePayButton', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method addApplePayButton', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method ifApplePayButtonTextIsValid', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method ifApplePayButtonStyleIsValid', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method setApplePayVersion', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method applePayButtonClickHandler', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method checkApplePayAvailability', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method checkApplePayWalletCardAvailability', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method getApplePaySessionObject', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method setAmountAndCurrency', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method _onInit', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method onValidateMerchantRequest', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method onPaymentAuthorized', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method onPaymentCanceled', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });
  // given
  describe('Method onValidateMerchantResponseSuccess', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });
  // given
  describe('Method onValidateMerchantResponseFailure', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });
  // given
  describe('Method subscribeStatusHandlers', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method setNotification', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method paymentProcess', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });

  // given
  describe('Method applePayProcess', () => {
    // then
    it('', () => {
      // const { instance } = ApplePayFixture();
    });
  });
});

function ApplePayFixture() {
  const config = {
    name: 'APPLEPAY',
    props: {
      sitereference: 'test_site',
      paymentRequest: {
        total: { label: 'Your Merchant Name', amount: '10.00' },
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        requiredBillingContactFields: ['postalAddress'],
        requiredShippingContactFields: ['postalAddress', 'name', 'phone', 'email'],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover']
      },
      merchantId: 'merchant.net.securetrading',
      sitesecurity: 'gABC123DEFABC'
    }
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const instance = new ApplePay(config, jwt);

  return {
    config,
    jwt,
    instance
  };
}
