import ApplePaySessionMock from '../../../src/core/integrations/ApplePaySessionMock';
(window as any).ApplePaySession = ApplePaySessionMock; // has to be defined before we import ApplePay
(window as any).ApplePaySession.supportsVersion = jest.fn();
(window as any).ApplePaySession.canMakePayments = jest.fn();
(window as any).ApplePaySession.canMakePaymentsWithActiveCard = jest.fn();
(window as any).ApplePaySession.STATUS_SUCCESS = 'SUCCESS';
const getType = require('jest-get-type');
import Language from '../../../src/core/shared/Language';
import { NotificationType } from '../../../src/core/models/NotificationEvent';
import ApplePay from '../../../src/core/integrations/ApplePay';
import DomMethods from '../../../src/core/shared/DomMethods';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('Apple Pay', () => {
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
    it('should return true if session exists', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayIsAvailable()).toBeTruthy();
    });
  });

  // given
  describe('Method ifBrowserSupportsApplePayVersion', () => {
    // then
    it('should return true if browser supported', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession.supportsVersion = jest.fn().mockReturnValue(true);
      expect(instance.ifBrowserSupportsApplePayVersion(4)).toBeTruthy();
    });
    // then
    it('should return false if browser supported', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession.supportsVersion = jest.fn().mockReturnValue(false);
      expect(instance.ifBrowserSupportsApplePayVersion(4)).not.toBeTruthy();
    });
  });

  // given
  describe('Method getApplePaySessionObject', () => {
    // then
    it('should get object', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession = jest.fn();
      const session = instance.getApplePaySessionObject();
      expect(session).toEqual({});
    });
  });

  // given
  describe('Method checkApplePayWalletCardAvailability', () => {
    // then
    it('should check availability', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession.canMakePaymentsWithActiveCard = jest.fn();
      instance.merchantId = '123456789';
      const availability = instance.checkApplePayWalletCardAvailability();
      expect(availability).toBe(undefined);
    });
  });

  // given
  describe('Method getApplePaySession', () => {
    // then
    it('should set applePayVersion', () => {
      const { instance } = ApplePayFixture();
      instance.ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(true);
      instance.setApplePayVersion();
      expect(instance.applePayVersion).toEqual(5);
    });
  });

  // given
  describe('set jwt and get jwt', () => {
    // then
    it('should set _jwt and get _jwt', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._jwt = 'MY VALUE';
      instance.jwt = 'SOMETHING';
      // @ts-ignore
      expect(instance._jwt).toBe('SOMETHING');
      expect(instance.jwt).toBe('SOMETHING');
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
      setPropertiesForVersion(applePayVersions[2], ApplePay.VERSION_4_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[1]}`, () => {
      setPropertiesForVersion(applePayVersions[1], ApplePay.BASIC_SUPPORTED_NETWORKS);
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
      const css = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${buttonText}; -apple-pay-button-style: ${buttonStyle}`;
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
      const css = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: donate; -apple-pay-button-style: white`;
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
      expect(element).toBeTruthy();
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
      instance.session = {};
      Object.defineProperty(instance.session, 'begin', { value: '', writable: true });
      instance.session.begin = jest.fn();
      instance.getApplePaySessionObject = jest.fn().mockReturnValueOnce({});
      instance.paymentProcess = jest.fn();
      instance.applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');

      const ev = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      document.getElementById(ApplePay.APPLE_PAY_BUTTON_ID).dispatchEvent(ev);
      expect(instance.paymentProcess).toHaveBeenCalledTimes(1);
      expect(instance.paymentProcess).toHaveBeenCalledWith();
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
    // then
    it('should handle error notification if it cannot set the value because amount is not set', () => {
      const { instance } = ApplePayFixture();
      instance.paymentRequest.total.amount = undefined;
      instance.paymentRequest.currencyCode = 'SOMETHING';
      // @ts-ignore
      instance._notification.error = jest.fn();
      instance.setAmountAndCurrency();
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('Amount and currency are not set', true);
    });
    // then
    it('should handle error notification if it cannot set the value because currency is not set', () => {
      const { instance } = ApplePayFixture();
      instance.paymentRequest.total.amount = 'SOMETHING';
      instance.paymentRequest.currencyCode = undefined;
      // @ts-ignore
      instance._notification.error = jest.fn();
      instance.setAmountAndCurrency();
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('Amount and currency are not set', true);
    });
  });

  // given
  describe('Method _onInit', () => {
    let instance: ApplePay;
    let spyApplePayVersion: any;
    let spySetSupportedNetworks: any;
    let spySetAmountAndCurrency: any;
    let spySetApplePayButtonProps: any;
    let spyAddApplePayButton: any;
    let spyApplePayProcess: any;

    // when
    beforeEach(() => {
      instance = ApplePayFixture().instance;
      instance.ifApplePayIsAvailable = jest.fn().mockReturnValueOnce(true);
      instance.ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(true);
      spyApplePayVersion = jest.spyOn(instance, 'setApplePayVersion');
      spySetSupportedNetworks = jest.spyOn(instance, 'setSupportedNetworks');
      spySetAmountAndCurrency = jest.spyOn(instance, 'setAmountAndCurrency');
      spySetApplePayButtonProps = jest.spyOn(instance, 'setApplePayButtonProps');
      spyAddApplePayButton = jest.spyOn(instance, 'addApplePayButton');
      spyApplePayProcess = jest.spyOn(instance, 'applePayProcess');
    });
    // then
    it('should spyApplePayVersion be called', () => {
      instance.onInit('donate', 'white');
      expect(spyApplePayVersion).toHaveBeenCalled();
    });
    // then
    it('should spySetSupportedNetworks be called', () => {
      instance.onInit('donate', 'white');
      expect(spySetSupportedNetworks).toHaveBeenCalled();
    });
    // then
    it('should spySetAmountAndCurrency be called', () => {
      instance.onInit('donate', 'white');
      expect(spySetAmountAndCurrency).toHaveBeenCalled();
    });

    // then
    it('should spySetApplePayButtonProps be called', () => {
      instance.onInit('donate', 'white');
      expect(spySetApplePayButtonProps).toHaveBeenCalled();
    });

    // then
    it('should spyAddApplePayButton be called', () => {
      instance.onInit('donate', 'white');
      expect(spyAddApplePayButton).toHaveBeenCalled();
    });

    // then
    it('should spyApplePayProcess be called', () => {
      instance.onInit('donate', 'white');
      expect(spyApplePayProcess).toHaveBeenCalled();
    });
  });

  // given
  describe('Method onValidateMerchantRequest', () => {
    // then
    it('should onvalidatemerchant handler has been set', () => {
      const { instance } = ApplePayFixture();
      instance.session = {};
      Object.defineProperty(instance.session, 'onvalidatemerchant', { value: '', writable: true });
      instance.onValidateMerchantRequest();
      expect(getType(instance.session.onvalidatemerchant)).toBe('function');
    });

    it('should call onvalidatemerchant and set walletvalidationurl and process walletverify', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.walletVerify = jest
        .fn()
        .mockResolvedValueOnce({ response: { myData: 'respData' }, jwt: 'ajwtvalue' });
      instance.onValidateMerchantResponseSuccess = jest.fn();
      // @ts-ignore
      instance._notification.success = jest.fn();
      instance.session = {};
      Object.defineProperty(instance.session, 'onvalidatemerchant', { value: '', writable: true });
      instance.onValidateMerchantRequest();

      await instance.session.onvalidatemerchant({ validationURL: 'https://example.com' });

      expect(instance.payment.walletVerify).toHaveBeenCalledTimes(1);
      expect(instance.payment.walletVerify).toHaveBeenCalledWith({
        walletmerchantid: 'merchant.net.securetrading',
        walletrequestdomain: 'localhost',
        walletsource: 'APPLEPAY',
        walletvalidationurl: 'https://example.com'
      });
      expect(instance.validateMerchantRequestData.walletvalidationurl).toBe('https://example.com');
      expect(instance.onValidateMerchantResponseSuccess).toHaveBeenCalledTimes(1);
      expect(instance.onValidateMerchantResponseSuccess).toHaveBeenCalledWith({ myData: 'respData' });
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledTimes(0);
    });

    it('should call onvalidatemerchant and set walletvalidationurl handle errors', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.walletVerify = jest
        .fn()
        .mockRejectedValueOnce({ errorcode: '30000', errormessage: 'Invalid field' });
      instance.onValidateMerchantResponseFailure = jest.fn();
      // @ts-ignore
      instance._notification.error = jest.fn();
      instance.session = {};
      Object.defineProperty(instance.session, 'onvalidatemerchant', { value: '', writable: true });
      instance.onValidateMerchantRequest();

      await instance.session.onvalidatemerchant({ validationURL: 'https://example.com' });

      expect(instance.payment.walletVerify).toHaveBeenCalledTimes(1);
      expect(instance.payment.walletVerify).toHaveBeenCalledWith({
        walletmerchantid: 'merchant.net.securetrading',
        walletrequestdomain: 'localhost',
        walletsource: 'APPLEPAY',
        walletvalidationurl: 'https://example.com'
      });
      expect(instance.validateMerchantRequestData.walletvalidationurl).toBe('https://example.com');
      expect(instance.onValidateMerchantResponseFailure).toHaveBeenCalledTimes(1);
      expect(instance.onValidateMerchantResponseFailure).toHaveBeenCalledWith({
        errorcode: '30000',
        errormessage: 'Invalid field'
      });
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('30000: Invalid field', true);
    });
  });

  // given
  describe('Method onPaymentAuthorized', () => {
    // then
    it('should onpaymentauthorized handler has been set', () => {
      const { instance } = ApplePayFixture();
      instance.session = {};
      Object.defineProperty(instance.session, 'onpaymentauthorized', { value: '', writable: true });
      instance.onPaymentAuthorized();
      expect(getType(instance.session.onpaymentauthorized)).toBe('function');
    });

    it('should call onpaymentauthorized and set paymentDetails and process successful AUTH', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.processPayment = jest.fn().mockResolvedValueOnce({ myData: 'response' });
      // @ts-ignore
      instance._notification.success = jest.fn();
      DomMethods.parseMerchantForm = jest.fn().mockReturnValueOnce({ billingfirstname: 'BOB' });
      instance.getPaymentSuccessStatus = jest.fn().mockReturnValueOnce('SUCCESS');
      // @ts-ignore
      instance.tokenise = false;
      instance.validateMerchantRequestData.walletsource = 'APPLEPAY';
      instance.session = { completePayment: jest.fn() };
      Object.defineProperty(instance.session, 'onpaymentauthorized', { value: '', writable: true });
      instance.onPaymentAuthorized();

      await instance.session.onpaymentauthorized({ payment: { TOKEN: 'TOKEN DATA' } });

      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
      expect(instance.payment.processPayment).toHaveBeenCalledWith(
        ['AUTH'],
        { walletsource: 'APPLEPAY', wallettoken: '{"TOKEN":"TOKEN DATA"}' },
        { billingfirstname: 'BOB' }
      );
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledWith('Payment has been successfully processed', true);
      expect(instance.session.completePayment).toHaveBeenCalledTimes(1);
      expect(instance.session.completePayment).toHaveBeenCalledWith({ status: 'SUCCESS', errors: [] });
    });

    it('should call onpaymentauthorized and set paymentDetails and process successful CACHETOKEN', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.processPayment = jest.fn().mockResolvedValueOnce({ myData: 'response' });
      // @ts-ignore
      instance._notification.success = jest.fn();
      DomMethods.parseMerchantForm = jest.fn().mockReturnValueOnce({ billingfirstname: 'BOB' });
      instance.getPaymentSuccessStatus = jest.fn().mockReturnValueOnce('SUCCESS');
      // @ts-ignore
      instance.requestTypes = ['CACHETOKENISE'];
      instance.validateMerchantRequestData.walletsource = 'APPLEPAY';
      instance.session = { completePayment: jest.fn() };
      Object.defineProperty(instance.session, 'onpaymentauthorized', { value: '', writable: true });
      instance.onPaymentAuthorized();

      await instance.session.onpaymentauthorized({ payment: { TOKEN: 'TOKEN DATA' } });

      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
      expect(instance.payment.processPayment).toHaveBeenCalledWith(
        ['CACHETOKENISE'],
        { walletsource: 'APPLEPAY', wallettoken: '{"TOKEN":"TOKEN DATA"}' },
        { billingfirstname: 'BOB' }
      );
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledWith('Payment has been successfully processed', true);
      expect(instance.session.completePayment).toHaveBeenCalledTimes(1);
      expect(instance.session.completePayment).toHaveBeenCalledWith({ status: 'SUCCESS', errors: [] });
    });

    it('should call onpaymentauthorized and set paymentDetails and handle failure', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.processPayment = jest.fn().mockRejectedValueOnce({ myData: 'response' });
      // @ts-ignore
      instance._notification.error = jest.fn();
      DomMethods.parseMerchantForm = jest.fn().mockReturnValueOnce({ billingfirstname: 'BOB' });
      instance.getPaymentFailureStatus = jest.fn().mockReturnValueOnce('FAILURE');
      // @ts-ignore
      instance.tokenise = false;
      instance.validateMerchantRequestData.walletsource = 'APPLEPAY';
      instance.session = { completePayment: jest.fn() };
      Object.defineProperty(instance.session, 'onpaymentauthorized', { value: '', writable: true });
      instance.onPaymentAuthorized();

      await instance.session.onpaymentauthorized({ payment: { TOKEN: 'TOKEN DATA' } });

      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
      expect(instance.payment.processPayment).toHaveBeenCalledWith(
        ['AUTH'],
        { walletsource: 'APPLEPAY', wallettoken: '{"TOKEN":"TOKEN DATA"}' },
        { billingfirstname: 'BOB' }
      );
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('An error occurred', true);
      expect(instance.session.completePayment).toHaveBeenCalledTimes(1);
      expect(instance.session.completePayment).toHaveBeenCalledWith({ status: 'FAILURE', errors: [] });
    });
  });

  // given
  describe('Method getPaymentSuccessStatus', () => {
    // then
    it('should return success', () => {
      const { instance } = ApplePayFixture();
      expect(instance.getPaymentSuccessStatus()).toBe('SUCCESS');
    });
  });

  // given
  describe('Method getPaymentFailureStatus', () => {
    // then
    it('should return error', () => {
      const { instance } = ApplePayFixture();
      expect(instance.getPaymentFailureStatus()).toBe('FAILURE');
    });
  });

  // given
  describe('Method onPaymentCanceled', () => {
    // then
    it('should oncancel handler has been set', () => {
      const { instance } = ApplePayFixture();
      instance.session = {};
      Object.defineProperty(instance.session, 'oncancel', { value: '', writable: true });
      instance.onPaymentCanceled();
      expect(getType(instance.session.oncancel)).toBe('function');

      // @ts-ignore
      instance._notification.warning = jest.fn();
      instance.session.oncancel({});
      // @ts-ignore
      expect(instance._notification.warning).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.warning).toHaveBeenCalledWith('Payment has been cancelled', true);
    });
  });
  // given
  describe('Method onValidateMerchantResponseSuccess', () => {
    // then
    it('should set walletmerchantid if walletsession is set ', () => {
      const response = { walletsession: '{"merchantIdentifier":123456}' };
      const { instance } = ApplePayFixture();
      instance.session = {};
      instance.session.completeMerchantValidation = jest.fn();
      instance.onValidateMerchantResponseSuccess(response);
      // @ts-ignore
      expect(instance.validateMerchantRequestData.walletmerchantid).toEqual(123456);
    });

    // then
    it('should call onValidateMerchantResponseFailure if walletsession is not set ', () => {
      const response = { walletsession: '' };
      const { instance } = ApplePayFixture();
      instance.session = {};
      instance.session.abort = jest.fn();
      const spy = jest.spyOn(instance, 'onValidateMerchantResponseFailure');
      instance.onValidateMerchantResponseSuccess(response);
      expect(spy).toHaveBeenCalled();
    });
  });
  // given
  describe('Method onValidateMerchantResponseFailure', () => {
    // then
    it('should setNotification has been called', () => {
      const { instance } = ApplePayFixture();
      const spy = jest.spyOn(instance, 'onValidateMerchantResponseFailure');
      instance.session = {};
      instance.session.abort = jest.fn();
      instance.onValidateMerchantResponseFailure('some error');
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('Method subscribeStatusHandlers', () => {
    let sessionObjectFake: object;
    let instance: any;
    beforeEach(() => {
      instance = ApplePayFixture().instance;
      sessionObjectFake = {
        completePaymentMethodSelection: jest.fn(),
        completeShippingContactSelection: jest.fn(),
        completeShippingMethodSelection: jest.fn(),
        onpaymentmethodselected: undefined,
        onshippingcontactselected: undefined,
        onshippingmethodselected: undefined
      };
      instance.session = sessionObjectFake;
      instance.paymentRequest = { total: { amount: '10.00', label: 'someLabel' } };
    });
    // then
    it('should set callback functions', () => {
      instance.subscribeStatusHandlers();
      expect(instance.session.onpaymentmethodselected).toBeInstanceOf(Function);
      expect(instance.session.onshippingcontactselected).toBeInstanceOf(Function);
      expect(instance.session.onshippingmethodselected).toBeInstanceOf(Function);
    });

    // then
    it('calling onpaymentmethodselected should call completePaymentMethodSelection', () => {
      instance.subscribeStatusHandlers();
      instance.session.onpaymentmethodselected({ paymentMethod: 'MYMETHOD' });
      expect(instance.session.completePaymentMethodSelection).toHaveBeenCalledTimes(1);
      expect(instance.session.completePaymentMethodSelection).toHaveBeenCalledWith({
        newTotal: {
          amount: '10.00',
          label: 'someLabel',
          type: 'final'
        }
      });
      expect(instance.session.completeShippingMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance.session.completeShippingContactSelection).toHaveBeenCalledTimes(0);
    });
    // then
    it('calling onshippingmethodselected should call completeShippingMethodSelection', () => {
      instance.subscribeStatusHandlers();
      instance.session.onshippingmethodselected({ paymentMethod: 'MYMETHOD' });
      expect(instance.session.completePaymentMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance.session.completeShippingMethodSelection).toHaveBeenCalledTimes(1);
      expect(instance.session.completeShippingMethodSelection).toHaveBeenCalledWith({
        newTotal: {
          amount: '10.00',
          label: 'someLabel',
          type: 'final'
        }
      });
      expect(instance.session.completeShippingContactSelection).toHaveBeenCalledTimes(0);
    });
    // then
    it('calling onshippingmethodselected should call completeShippingContactSelection', () => {
      instance.subscribeStatusHandlers();
      instance.session.onshippingcontactselected({ paymentMethod: 'MYMETHOD' });
      expect(instance.session.completePaymentMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance.session.completeShippingMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance.session.completeShippingContactSelection).toHaveBeenCalledTimes(1);
      expect(instance.session.completeShippingContactSelection).toHaveBeenCalledWith({
        newTotal: {
          amount: '10.00',
          label: 'someLabel',
          type: 'final'
        }
      });
    });
  });

  // given
  describe('Method paymentProcess', () => {
    let sessionObjectFake: object;
    beforeEach(() => {
      sessionObjectFake = { begin: jest.fn() };
    });

    // then
    it('should call correct functions', () => {
      const { instance } = ApplePayFixture();
      instance.getApplePaySessionObject = jest.fn().mockReturnValueOnce(sessionObjectFake);
      instance.onValidateMerchantRequest = jest.fn();
      instance.subscribeStatusHandlers = jest.fn();
      instance.onPaymentAuthorized = jest.fn();
      instance.onPaymentCanceled = jest.fn();

      instance.paymentProcess();
      expect(instance.getApplePaySessionObject).toHaveBeenCalled();
      expect(instance.onValidateMerchantRequest).toHaveBeenCalled();
      expect(instance.subscribeStatusHandlers).toHaveBeenCalled();
      expect(instance.onPaymentAuthorized).toHaveBeenCalled();
      expect(instance.onPaymentCanceled).toHaveBeenCalled();

      expect(instance.session.begin).toHaveBeenCalled();
    });
  });

  // given
  describe('Method applePayProcess', () => {
    // then
    it('should do nothing if checkApplePayAvailability returns false', () => {
      const { instance } = ApplePayFixture();
      instance.checkApplePayAvailability = jest.fn().mockReturnValueOnce(false);
      instance.checkApplePayWalletCardAvailability = jest.fn();
      instance.applePayProcess();
      expect(instance.checkApplePayAvailability).toHaveBeenCalledTimes(1);
      expect(instance.checkApplePayWalletCardAvailability).not.toHaveBeenCalled();
    });
    // then
    it('should call only canMakePayments if checkApplePayAvailability returns true and canMakePayments returns false', async () => {
      const { instance } = ApplePayFixture();
      jest.resetAllMocks();
      jest.spyOn(instance, 'checkApplePayAvailability').mockReturnValueOnce(true);
      jest.spyOn(instance, 'checkApplePayWalletCardAvailability').mockReturnValue(
        new Promise(function(resolve, reject) {
          resolve(false);
        })
      );
      jest.spyOn(instance, 'applePayButtonClickHandler');
      await instance.applePayProcess();
      expect(instance.checkApplePayWalletCardAvailability).toHaveBeenCalled();
      expect(instance.applePayButtonClickHandler).not.toHaveBeenCalled();
    });

    // then
    it('should call applePayButtonClickHandler if checkApplePayAvailability returns true and canMakePayments returns true', async () => {
      const { instance } = ApplePayFixture();
      jest.resetAllMocks();
      jest.spyOn(instance, 'checkApplePayAvailability').mockReturnValueOnce(true);
      jest.spyOn(instance, 'checkApplePayWalletCardAvailability').mockReturnValue(
        new Promise(function(resolve, reject) {
          resolve(true);
        })
      );
      jest.spyOn(instance, 'applePayButtonClickHandler');
      await instance.applePayProcess();
      expect(instance.checkApplePayWalletCardAvailability).toHaveBeenCalled();
      expect(instance.applePayButtonClickHandler).toHaveBeenCalled();
    });
  });
});

function ApplePayFixture() {
  const html =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  document.body.innerHTML = html;
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
    buttonStyle: 'white-outline',
    requestTypes: ['AUTH']
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const instance = new ApplePay(config, jwt, 'https://example.com');

  return {
    config,
    jwt,
    instance
  };
}
