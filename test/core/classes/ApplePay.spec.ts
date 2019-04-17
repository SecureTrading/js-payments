import ApplePay from './../../../src/core/classes/ApplePay.class';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('Class Apple Pay', () => {
  // given
  describe('On init', () => {
    // then
    it('should set instance with proper settings', () => {
      const { instance } = ApplePayFixture();
      expect(instance).toBeTruthy();
    });
  });

  // given
  describe('Method ifApplePayIsAvailable', () => {
    // then
    it('should return undefined if device is not Mac', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayIsAvailable()).toBeFalsy();
    });
  });

  // given
  describe('Method setApplePayVersion', () => {
    // then
    it('should set applePayVersion', () => {
      const { instance } = ApplePayFixture();
      instance.ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(true);
      instance.setApplePayVersion();
      expect(instance.applePayVersion).toEqual(5);
    });
  });

  // given
  describe('Method setSupportedNetworks', () => {
    // when
    const { instance } = ApplePayFixture();
    const applePayVersions = [2, 3, 4, 5];

    function setPropertiesForVersion(version: number, networks: string[]) {
      instance.applePayVersion = version;
      instance.setSupportedNetworks();
      expect(instance.paymentRequest.supportedNetworks).toEqual(networks);
    }

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[3]}`, () => {
      setPropertiesForVersion(applePayVersions[3], ApplePay.VERSION_5_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[2]}`, () => {
      setPropertiesForVersion(applePayVersions[2], ApplePay.VERSION_3_4_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[1]}`, () => {
      setPropertiesForVersion(applePayVersions[1], ApplePay.VERSION_3_4_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[0]}`, () => {
      setPropertiesForVersion(applePayVersions[0], ApplePay.BASIC_SUPPORTED_NETWORKS);
    });
  });

  // given
  describe('Method setApplePayButtonProps', () => {
    let buttonStyle: string;
    let buttonText: string;
    beforeEach(() => {
      buttonStyle = 'white';
      buttonText = 'donate';
    });
    // then
    it(`should set buttonText and buttonStyle if they are both from list of available values`, () => {
      const { instance } = ApplePayFixture();
      instance.setApplePayButtonProps(buttonText, buttonStyle);
      expect(instance.buttonText).toEqual(buttonText);
      expect(instance.buttonStyle).toEqual(buttonStyle);
    });

    // then
    it('should set buttonText and buttonStyle with default values if they are both not from list of available values', () => {
      buttonStyle = 'NavajoWhite';
      buttonText = 'click here to pay with apple pay';
      const { instance } = ApplePayFixture();
      instance.setApplePayButtonProps(buttonText, buttonStyle);
      expect(instance.buttonText).toEqual(ApplePay.AVAILABLE_BUTTON_TEXTS[0]);
      expect(instance.buttonStyle).toEqual(ApplePay.AVAILABLE_BUTTON_STYLES[0]);
    });

    // then
    it('should set _applePayButtonProps style value', () => {
      const css = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${buttonText}; -applepay-button-style: ${buttonStyle}`;
      const { instance } = ApplePayFixture();
      instance.setApplePayButtonProps(buttonText, buttonStyle);
      expect(instance.applePayButtonProps['style']).toEqual(css);
    });
  });

  // given
  describe('Method createApplePayButton', () => {
    // then
    it('should return Apple Pay button with all props set', () => {
      const { instance } = ApplePayFixture();
      const button =
        '<div style="-webkit-appearance: -apple-pay-button; -apple-pay-button-type: donate; -applepay-button-style: white" />';
      instance.applePayButtonProps[
        'style'
      ] = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: donate; -applepay-button-style: white`;

      expect(instance.createApplePayButton()).toBeTruthy();
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
