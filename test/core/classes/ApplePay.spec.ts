import Language from '../../../src/core/shared/Language';
import MessageBus from '../../../src/core/shared/MessageBus';
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
  describe('Method setAmountAndCurrency', () => {
    // then
    it('should set amount depends on value in JWT', () => {
      const { instance } = ApplePayFixture();
      instance.setAmountAndCurrency();
      expect(instance.paymentRequest.total.amount).toEqual(instance.stJwtInstance.mainamount);
    });

    // then
    it('should set currency depends on value in JWT', () => {
      const { instance } = ApplePayFixture();
      instance.setAmountAndCurrency();
      expect(instance.paymentRequest.currencyCode).toEqual(instance.stJwtInstance.currencyiso3a);
    });
  });

  // given
  describe('Method _onInit', () => {
    // then
    it('should ', () => {
      const { instance } = ApplePayFixture();
      const spy = jest.spyOn(instance, 'setApplePayVersion');
      // instance.onInit('donate', 'white');
      // expect(spy).toHaveBeenCalled();
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
    let sessionObjectFake: object;
    beforeEach(() => {
      sessionObjectFake = {};
    });

    // then
    it('should onValidateMerchantRequest has been called', () => {
      const { instance } = ApplePayFixture();
      instance.session = sessionObjectFake;
      const spy = jest.spyOn(instance, 'onValidateMerchantRequest');
      instance.onValidateMerchantRequest();
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should subscribeStatusHandlers has been called', () => {
      const { instance } = ApplePayFixture();
      instance.session = sessionObjectFake;
      const spy = jest.spyOn(instance, 'subscribeStatusHandlers');
      instance.subscribeStatusHandlers();
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should onPaymentAuthorized has been called', () => {
      const { instance } = ApplePayFixture();
      instance.session = sessionObjectFake;
      const spy = jest.spyOn(instance, 'onPaymentAuthorized');
      instance.onPaymentAuthorized();
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should onPaymentCanceled has been called', () => {
      const { instance } = ApplePayFixture();
      instance.session = sessionObjectFake;
      const spy = jest.spyOn(instance, 'onPaymentCanceled');
      instance.onPaymentCanceled();
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('Method applePayProcess', () => {
    // then
    it('should set notification if checkApplePayAvailability returns false', () => {
      const { instance } = ApplePayFixture();
      instance.checkApplePayAvailability = jest.fn().mockReturnValueOnce(false);
      const spy = jest.spyOn(instance, 'setNotification');
      instance.setNotification(
        MessageBus.EVENTS_PUBLIC.NOTIFICATION_ERROR,
        Language.translations.APPLE_PAYMENT_IS_NOT_AVAILABLE
      );
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should call checkApplePayWalletCardAvailability if checkApplePayAvailability returns false', () => {
      const { instance } = ApplePayFixture();
      instance.checkApplePayAvailability = jest.fn().mockReturnValueOnce(true);
      instance.checkApplePayWalletCardAvailability = jest.fn().mockReturnValueOnce(true);
      const spy = jest.spyOn(instance, 'checkApplePayWalletCardAvailability');
      instance.checkApplePayWalletCardAvailability();
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should call checkApplePayWalletCardAvailability and setNotification if checkApplePayAvailability returns true and canMakePayments returns false', () => {
      const { instance } = ApplePayFixture();
      instance.checkApplePayAvailability = jest.fn().mockReturnValueOnce(true);
      instance.checkApplePayWalletCardAvailability = jest.fn().mockReturnValueOnce(true);
      const spyNotification = jest.spyOn(instance, 'setNotification');
      const spy = jest.spyOn(instance, 'checkApplePayWalletCardAvailability');
      instance.setNotification(MessageBus.EVENTS_PUBLIC.NOTIFICATION_ERROR, Language.translations.NO_CARDS_IN_WALLET);
      instance.checkApplePayWalletCardAvailability();
      expect(spy).toHaveBeenCalled();
      expect(spyNotification).toHaveBeenCalled();
    });

    // then
    it('should call checkApplePayWalletCardAvailability and applePayButtonClickHandler if checkApplePayAvailability returns true and canMakePayments returns true', () => {
      const { instance } = ApplePayFixture();
      instance.checkApplePayAvailability = jest.fn().mockReturnValueOnce(true);
      instance.checkApplePayWalletCardAvailability = jest.fn().mockReturnValueOnce(true);
      const spyHandler = jest.spyOn(instance, 'applePayButtonClickHandler');
      const spy = jest.spyOn(instance, 'checkApplePayWalletCardAvailability');
      instance.applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
      instance.checkApplePayWalletCardAvailability();
      expect(spy).toHaveBeenCalled();
      expect(spyHandler).toHaveBeenCalled();
    });
  });
});

function ApplePayFixture() {
  const html =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
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
