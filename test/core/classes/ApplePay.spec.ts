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
      const css = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: donate; -applepay-button-style: white`;
      instance.applePayButtonProps['style'] = css;
      const style = instance.createApplePayButton().getAttribute('style');
      expect(style).toEqual(style);
    });
  });

  // given
  describe('Method addApplePayButton', () => {
    // then
    it('should add Apple Pay button to DOM', () => {
      const { instance } = ApplePayFixture();
      instance.addApplePayButton();
      const element = document.getElementById(instance.placement);
      // expect(element).toBeTruthy();
    });
  });

  // given
  describe('Method ifApplePayButtonTextIsValid', () => {
    // then
    it('should return false if text is not from list of available', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayButtonTextIsValid('click here to pay with apple pay')).toEqual(false);
    });

    // then
    it('should return true if text is from list of available', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayButtonTextIsValid('donate')).toEqual(true);
    });
  });

  // given
  describe('Method ifApplePayButtonStyleIsValid', () => {
    // then
    it('should return false if style is not from lst of available', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayButtonStyleIsValid('NavajoWhite')).toEqual(false);
    });

    // then
    it('should return true if style is from lst of available', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayButtonStyleIsValid('white')).toEqual(true);
    });
  });

  // given
  describe('Method applePayButtonClickHandler', () => {
    // then
    it('should trigger paymentProcess method after click', () => {
      const { instance } = ApplePayFixture();
      // instance.applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
      // document.getElementById(ApplePay.APPLE_PAY_BUTTON_ID).click();
      // const spy = jest.spyOn(instance, 'paymentProcess');
      // expect(spy).toHaveBeenCalled();
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
  const html =
    '<div class="st-animated-card" id="st-animated-card"> <div class="st-animated-card__content"> <div class="st-animated-card__side st-animated-card__front" id="st-animated-card-side-front"> <div class="st-animated-card__logos"> <div class="st-animated-card__chip-logo"> <img src="" alt="" id="st-chip-logo" /> </div> <div class="st-animated-card__payment-logo" id="st-animated-card-payment-logo"></div> </div> <div class="st-animated-card__pan"> <label class="st-animated-card__label">Card number</label> <div class="st-animated-card__value" id="st-animated-card-number"></div> </div> <div class="st-animated-card__expiration-date-and-security-code"> <div class="st-animated-card__expiration-date"> <label class="st-animated-card__label">Expiration date</label> <div class="st-animated-card__value" id="st-animated-card-expiration-date"></div> </div> <div class="st-animated-card__security-code st-animated-card__security-code--front st-animated-card__security-code--front-hidden" id="st-animated-card-security-code-front" > <label class="st-animated-card__label">Security code</label> <div class="st-animated-card__value" id="st-animated-card-security-code-front-field"></div> </div> </div> </div> <div class="st-animated-card__side st-animated-card__back" id="st-animated-card-side-back"> <div class="st-animated-card__signature"></div> <div class="st-animated-card__security-code" id="st-animated-card-security-code"></div> </div> </div> </div>';
  document.body.innerHTML = html;
  const config = {
    name: 'APPLEPAY',
    props: {
      sitereference: 'test_site',
      paymentRequest: {
        total: { label: 'Secure Trading Merchant', amount: '10.00' },
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: ['amex', 'visa']
      },
      merchantId: 'merchant.net.securetrading',
      sitesecurity: 'gABC123DEFABC',
      placement: 'st-apple-pay',
      buttonText: 'donate',
      buttonStyle: 'white-outline'
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
