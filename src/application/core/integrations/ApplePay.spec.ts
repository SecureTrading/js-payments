import { ApplePayErrorMock } from './ApplePayErrorMock';
import { ApplePaySessionMock } from './ApplePaySessionMock';

(window as any).ApplePaySession = ApplePaySessionMock; // has to be defined before we import ApplePay
(window as any).ApplePayError = ApplePayErrorMock; // has to be defined before we import ApplePay
(window as any).ApplePaySession.supportsVersion = jest.fn();
(window as any).ApplePaySession.canMakePayments = jest.fn();
(window as any).ApplePaySession.canMakePaymentsWithActiveCard = jest.fn();
(window as any).ApplePaySession.STATUS_SUCCESS = 'SUCCESS';
const getType = require('jest-get-type');
import { ApplePay } from './ApplePay';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { anyString, instance as mockInstance, mock, when } from 'ts-mockito';
import { ConfigProvider } from '../services/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { EMPTY, of } from 'rxjs';

jest.mock('../../../../src/application/core/shared/MessageBus');
jest.mock('../../../../src/application/core/integrations/GoogleAnalytics');
jest.mock('../../../../src/client/classes/notification/NotificationService');

// given
describe('ApplePay', () => {
  // given
  describe('On init', () => {
    // then
    it('should set instance with proper settings', () => {
      const { instance } = ApplePayFixture();
      expect(instance).toBeTruthy();
    });
  });

  // given
  describe('ifApplePayIsAvailable()', () => {
    // then
    it('should return true if session exists', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance.ifApplePayIsAvailable()).toBeTruthy();
    });
  });

  // given
  describe('_ifBrowserSupportsApplePayVersion()', () => {
    // then
    it('should return true if browser supported', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession.supportsVersion = jest.fn().mockReturnValue(true);
      // @ts-ignore
      expect(instance._ifBrowserSupportsApplePayVersion(4)).toBeTruthy();
    });
    // then
    it('should return false if browser supported', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession.supportsVersion = jest.fn().mockReturnValue(false);
      // @ts-ignore
      expect(instance._ifBrowserSupportsApplePayVersion(4)).not.toBeTruthy();
    });
  });

  // given
  describe('getApplePaySessionObject()', () => {
    // then
    it('should get object', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession = jest.fn();
      // @ts-ignore
      const session = instance.getApplePaySessionObject();
      expect(session).toEqual({});
    });
  });

  // given
  describe('checkApplePayWalletCardAvailability()', () => {
    // then
    it('should check availability', () => {
      const { instance } = ApplePayFixture();
      (window as any).ApplePaySession.canMakePaymentsWithActiveCard = jest.fn();
      // @ts-ignore
      instance._merchantId = '123456789';
      // @ts-ignore
      const availability = instance.checkApplePayWalletCardAvailability();
      expect(availability).toBe(undefined);
    });
  });

  // given
  describe('getApplePaySession()', () => {
    // then
    it('should set applePayVersion', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance.setApplePayVersion();
      // @ts-ignore
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
  describe('setSupportedNetworks()', () => {
    // when
    const { instance } = ApplePayFixture();
    const applePayVersions = [2, 3, 4, 5];

    function setPropertiesForVersion(version: number, networks: string[]) {
      // @ts-ignore
      instance.applePayVersion = version;
      // @ts-ignore
      instance._setSupportedNetworks();
      // @ts-ignore
      expect(instance._paymentRequest.supportedNetworks).toEqual(networks);
    }

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[3]}`, () => {
      // @ts-ignore
      instance._paymentRequest.supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
      // @ts-ignore
      setPropertiesForVersion(applePayVersions[3], ApplePay.VERSION_5_SUPPORTED_NETWORKS);
    });
    // then
    it(`should set subset of supported networks if merchant specifies subset ${applePayVersions[3]}`, () => {
      // @ts-ignore
      instance._paymentRequest.supportedNetworks = ['amex', 'visa'];
      // @ts-ignore
      setPropertiesForVersion(applePayVersions[3], ['amex', 'visa']);
    });
    // then
    it(`should set full set of supported networks if merchant specifies empty array ${applePayVersions[3]}`, () => {
      // @ts-ignore
      instance._paymentRequest.supportedNetworks = [];
      // @ts-ignore
      setPropertiesForVersion(applePayVersions[3], ApplePay.VERSION_5_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[2]}`, () => {
      // @ts-ignore
      instance._paymentRequest.supportedNetworks = ApplePay.VERSION_4_SUPPORTED_NETWORKS;
      // @ts-ignore
      setPropertiesForVersion(applePayVersions[2], ApplePay.VERSION_4_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[1]}`, () => {
      // @ts-ignore
      instance._paymentRequest.supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
      // @ts-ignore
      setPropertiesForVersion(applePayVersions[1], ApplePay.BASIC_SUPPORTED_NETWORKS);
    });

    // then
    it(`should set proper networks when Apple Pay version is equal ${applePayVersions[0]}`, () => {
      // @ts-ignore
      instance._paymentRequest.supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
      // @ts-ignore
      setPropertiesForVersion(applePayVersions[0], ApplePay.BASIC_SUPPORTED_NETWORKS);
    });
  });

  // given
  describe('_setApplePayButtonProps()', () => {
    let buttonStyle: string;
    let buttonText: string;
    beforeEach(() => {
      buttonStyle = 'white';
      buttonText = 'donate';
    });
    // then
    it(`should set buttonText and buttonStyle if they are both from list of available values`, () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._setApplePayButtonProps(buttonText, buttonStyle);
      // @ts-ignore
      expect(instance._buttonText).toEqual(buttonText);
      // @ts-ignore
      expect(instance._buttonStyle).toEqual(buttonStyle);
    });

    // then
    it('should set buttonText and buttonStyle with default values if they are both not from list of available values', () => {
      buttonStyle = 'NavajoWhite';
      buttonText = 'click here to pay with apple pay';
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._setApplePayButtonProps(buttonText, buttonStyle);
      // @ts-ignore
      expect(instance._buttonText).toEqual(ApplePay.AVAILABLE_BUTTON_TEXTS[0]);
      // @ts-ignore
      expect(instance._buttonStyle).toEqual(ApplePay.AVAILABLE_BUTTON_STYLES[0]);
    });

    // then
    it('should set _applePayButtonProps style value', () => {
      const css = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${buttonText}; -apple-pay-button-style: ${buttonStyle}`;
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._setApplePayButtonProps(buttonText, buttonStyle);
      expect(instance.applePayButtonProps['style']).toEqual(css);
    });
  });

  // given
  describe('createApplePayButton()', () => {
    // then
    it('should return Apple Pay button with all props set', () => {
      const { instance } = ApplePayFixture();
      const css = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: donate; -apple-pay-button-style: white`;
      instance.applePayButtonProps['style'] = css;
      // @ts-ignore
      const style = instance.createApplePayButton().getAttribute('style');
      expect(style).toEqual(style);
    });
  });

  // given
  describe('addApplePayButton()', () => {
    // then
    it('should add Apple Pay button to DOM', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._addApplePayButton();
      // @ts-ignore
      const element = document.getElementById(instance._placement);
      expect(element).toBeTruthy();
    });
  });

  // given
  describe('ifApplePayButtonTextIsValid()', () => {
    // then
    it('should return false if text is not from list of available', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance._ifApplePayButtonTextIsValid('click here to pay with apple pay')).toEqual(false);
    });

    // then
    it('should return true if text is from list of available', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance._ifApplePayButtonTextIsValid('donate')).toEqual(true);
    });
  });

  // given
  describe('ifApplePayButtonStyleIsValid()', () => {
    // then
    it('should return false if style is not from lst of available', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance._ifApplePayButtonStyleIsValid('NavajoWhite')).toEqual(false);
    });

    // then
    it('should return true if style is from lst of available', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance._ifApplePayButtonStyleIsValid('white')).toEqual(true);
    });
  });

  // given
  describe('applePayButtonClickHandler()', () => {
    // then
    it('should trigger paymentProcess method after click', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      Object.defineProperty(instance._session, 'begin', { value: '', writable: true });
      // @ts-ignore
      instance._session.begin = jest.fn();
      // @ts-ignore
      instance.getApplePaySessionObject = jest.fn().mockReturnValueOnce({});
      // @ts-ignore
      instance._paymentProcess = jest.fn();
      // @ts-ignore
      instance._applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');

      const ev = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      // @ts-ignore
      document.getElementById(ApplePay.APPLE_PAY_BUTTON_ID).dispatchEvent(ev);
      // @ts-ignore
      expect(instance._paymentProcess).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._paymentProcess).toHaveBeenCalledWith();
    });
  });

  // given
  describe('setAmountAndCurrency()', () => {
    // then
    it('should set amount depends on value in JWT', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._setAmountAndCurrency();
      // @ts-ignore
      expect(instance._paymentRequest.total.amount).toEqual(instance._stJwtInstance.mainamount);
    });

    // then
    it('should set currency depends on value in JWT', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._setAmountAndCurrency();
      // @ts-ignore
      expect(instance._paymentRequest.currencyCode).toEqual(instance._stJwtInstance.currencyiso3a);
    });
    // then
    it('should handle error notification if it cannot set the value because amount is not set', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._paymentRequest.total.amount = undefined;
      // @ts-ignore
      instance._paymentRequest.currencyCode = 'SOMETHING';
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._setAmountAndCurrency();
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('Amount and currency are not set');
    });
    // then
    it('should handle error notification if it cannot set the value because currency is not set', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._paymentRequest.total.amount = 'SOMETHING';
      // @ts-ignore
      instance._paymentRequest.currencyCode = undefined;
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._setAmountAndCurrency();
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('Amount and currency are not set');
    });
  });

  // given
  describe('_onInit()', () => {
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
      // @ts-ignore
      instance.ifApplePayIsAvailable = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance._ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      spyApplePayVersion = jest.spyOn(instance, 'setApplePayVersion');
      // @ts-ignore
      spySetSupportedNetworks = jest.spyOn(instance, '_setSupportedNetworks');
      // @ts-ignore
      spySetAmountAndCurrency = jest.spyOn(instance, '_setAmountAndCurrency');
      // @ts-ignore
      spySetApplePayButtonProps = jest.spyOn(instance, '_setApplePayButtonProps');
      // @ts-ignore
      spyAddApplePayButton = jest.spyOn(instance, '_addApplePayButton');
      // @ts-ignore
      spyApplePayProcess = jest.spyOn(instance, '_applePayProcess');
    });
    // then
    it('should spyApplePayVersion be called', () => {
      // @ts-ignore
      instance._onInit('donate', 'white');
      expect(spyApplePayVersion).toHaveBeenCalled();
    });
    // then
    it('should spySetSupportedNetworks be called', () => {
      // @ts-ignore
      instance._onInit('donate', 'white');
      expect(spySetSupportedNetworks).toHaveBeenCalled();
    });
    // then
    it('should spySetAmountAndCurrency be called', () => {
      // @ts-ignore
      instance._onInit('donate', 'white');
      expect(spySetAmountAndCurrency).toHaveBeenCalled();
    });

    // then
    it('should spySetApplePayButtonProps be called', () => {
      // @ts-ignore
      instance._onInit('donate', 'white');
      expect(spySetApplePayButtonProps).toHaveBeenCalled();
    });

    // then
    it('should spyAddApplePayButton be called', () => {
      // @ts-ignore
      instance._onInit('donate', 'white');
      expect(spyAddApplePayButton).toHaveBeenCalled();
    });

    // then
    it('should spyApplePayProcess be called', () => {
      // @ts-ignore
      instance._onInit('donate', 'white');
      expect(spyApplePayProcess).toHaveBeenCalled();
    });
  });

  // given
  describe('onValidateMerchantRequest()', () => {
    // then
    it('should onvalidatemerchant handler has been set', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      Object.defineProperty(instance._session, 'onvalidatemerchant', { value: '', writable: true });
      // @ts-ignore
      instance._onValidateMerchantRequest();
      // @ts-ignore
      expect(getType(instance._session.onvalidatemerchant)).toBe('function');
    });

    it('should call onvalidatemerchant and set walletvalidationurl and process walletverify', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.walletVerify = jest
        .fn()
        .mockResolvedValueOnce({ response: { myData: 'respData' }, jwt: 'ajwtvalue' });
      // @ts-ignore
      instance._onValidateMerchantResponseSuccess = jest.fn();
      // @ts-ignore
      instance._notification.success = jest.fn();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      Object.defineProperty(instance._session, 'onvalidatemerchant', { value: '', writable: true });
      // @ts-ignore
      instance._onValidateMerchantRequest();

      // @ts-ignore
      await instance._session.onvalidatemerchant({ validationURL: 'https://example.com' });

      expect(instance.payment.walletVerify).toHaveBeenCalledTimes(1);
      expect(instance.payment.walletVerify).toHaveBeenCalledWith({
        walletmerchantid: 'merchant.net.securetrading',
        walletrequestdomain: 'localhost',
        walletsource: 'APPLEPAY',
        walletvalidationurl: 'https://example.com'
      });
      // @ts-ignore
      expect(instance._validateMerchantRequestData.walletvalidationurl).toBe('https://example.com');
      // @ts-ignore
      expect(instance._onValidateMerchantResponseSuccess).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._onValidateMerchantResponseSuccess).toHaveBeenCalledWith({ myData: 'respData' });
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledTimes(0);
    });

    it('should call onvalidatemerchant and set walletvalidationurl handle errors', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.walletVerify = jest
        .fn()
        .mockRejectedValueOnce({ errorcode: '30000', errormessage: 'Invalid field' });
      // @ts-ignore
      instance._onValidateMerchantResponseFailure = jest.fn();
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      Object.defineProperty(instance._session, 'onvalidatemerchant', { value: '', writable: true });
      // @ts-ignore
      instance._onValidateMerchantRequest();

      // @ts-ignore
      await instance._session.onvalidatemerchant({ validationURL: 'https://example.com' });

      expect(instance.payment.walletVerify).toHaveBeenCalledTimes(1);
      expect(instance.payment.walletVerify).toHaveBeenCalledWith({
        walletmerchantid: 'merchant.net.securetrading',
        walletrequestdomain: 'localhost',
        walletsource: 'APPLEPAY',
        walletvalidationurl: 'https://example.com'
      });
      // @ts-ignore
      expect(instance._validateMerchantRequestData.walletvalidationurl).toBe('https://example.com');
      // @ts-ignore
      expect(instance._onValidateMerchantResponseFailure).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._onValidateMerchantResponseFailure).toHaveBeenCalledWith({
        errorcode: '30000',
        errormessage: 'Invalid field'
      });
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith('30000: Invalid field');
    });
  });

  // given
  describe('onPaymentAuthorized()', () => {
    // then
    it('should onpaymentauthorized handler has been set', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      Object.defineProperty(instance._session, 'onpaymentauthorized', { value: '', writable: true });
      // @ts-ignore
      instance._onPaymentAuthorized();
      // @ts-ignore
      expect(getType(instance._session.onpaymentauthorized)).toBe('function');
    });

    it('should call onpaymentauthorized and set paymentDetails and process successful AUTH', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.processPayment = jest.fn().mockResolvedValueOnce({ response: { errorcode: '0' } });
      // @ts-ignore
      instance._displayNotification = jest.fn();
      // @ts-ignore
      instance._handleApplePayError = jest.fn();
      DomMethods.parseForm = jest.fn().mockReturnValueOnce({ billingfirstname: 'BOB' });
      // @ts-ignore
      instance.getPaymentSuccessStatus = jest.fn().mockReturnValueOnce('SUCCESS');
      // @ts-ignore
      instance._validateMerchantRequestData.walletsource = 'APPLEPAY';
      // @ts-ignore
      instance._session = { completePayment: jest.fn() };
      // @ts-ignore
      Object.defineProperty(instance._session, 'onpaymentauthorized', { value: '', writable: true });
      // @ts-ignore
      instance._onPaymentAuthorized();

      // @ts-ignore
      await instance._session.onpaymentauthorized({ payment: { TOKEN: 'TOKEN DATA' } });

      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
      expect(instance.payment.processPayment).toHaveBeenCalledWith(
        ['AUTH'],
        { walletsource: 'APPLEPAY', wallettoken: '{"TOKEN":"TOKEN DATA"}' },
        { billingfirstname: 'BOB' }
      );
      // @ts-ignore
      expect(instance._displayNotification).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._session.completePayment).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._handleApplePayError).toHaveBeenCalledWith({ errorcode: '0' });
    });

    it('should call onpaymentauthorized and set paymentDetails and process successful CACHETOKEN', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.processPayment = jest.fn().mockResolvedValueOnce({ response: { errorcode: '0' } });
      // @ts-ignore
      instance._displayNotification = jest.fn();
      // @ts-ignore
      instance._handleApplePayError = jest.fn();
      DomMethods.parseForm = jest.fn().mockReturnValueOnce({ billingfirstname: 'BOB' });
      // @ts-ignore
      instance.getPaymentSuccessStatus = jest.fn().mockReturnValueOnce('SUCCESS');
      // @ts-ignore
      instance._requestTypes = ['CACHETOKENISE'];
      // @ts-ignore
      instance._validateMerchantRequestData.walletsource = 'APPLEPAY';
      // @ts-ignore
      instance._session = { completePayment: jest.fn() };
      // @ts-ignore
      Object.defineProperty(instance._session, 'onpaymentauthorized', { value: '', writable: true });
      // @ts-ignore
      instance._onPaymentAuthorized();

      // @ts-ignore
      await instance._session.onpaymentauthorized({ payment: { TOKEN: 'TOKEN DATA' } });

      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
      expect(instance.payment.processPayment).toHaveBeenCalledWith(
        ['CACHETOKENISE'],
        { walletsource: 'APPLEPAY', wallettoken: '{"TOKEN":"TOKEN DATA"}' },
        { billingfirstname: 'BOB' }
      );
      // @ts-ignore
      expect(instance._displayNotification).toHaveBeenCalledTimes(1);
      // @ts-ignore
      // @ts-ignore
      expect(instance._session.completePayment).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._handleApplePayError).toHaveBeenCalledWith({ errorcode: '0' });
    });

    it('should call onpaymentauthorized and set paymentDetails and handle failure', async () => {
      const { instance } = ApplePayFixture();

      instance.payment.processPayment = jest.fn().mockRejectedValueOnce({ myData: 'response' });
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._handleApplePayError = jest.fn();
      DomMethods.parseForm = jest.fn().mockReturnValueOnce({ billingfirstname: 'BOB' });
      // @ts-ignore
      instance.getPaymentFailureStatus = jest.fn().mockReturnValueOnce('FAILURE');
      // @ts-ignore
      instance._validateMerchantRequestData.walletsource = 'APPLEPAY';
      // @ts-ignore
      instance._session = { completePayment: jest.fn() };
      // @ts-ignore
      Object.defineProperty(instance._session, 'onpaymentauthorized', { value: '', writable: true });
      // @ts-ignore
      instance._onPaymentAuthorized();

      // @ts-ignore
      await instance._session.onpaymentauthorized({ payment: { TOKEN: 'TOKEN DATA' } });

      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
      expect(instance.payment.processPayment).toHaveBeenCalledWith(
        ['AUTH'],
        { walletsource: 'APPLEPAY', wallettoken: '{"TOKEN":"TOKEN DATA"}' },
        { billingfirstname: 'BOB' }
      );
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('getPaymentSuccessStatus()', () => {
    // then
    it('should return success', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance.getPaymentSuccessStatus()).toBe('SUCCESS');
    });
  });

  // given
  describe('Method getPaymentFailureStatus', () => {
    // then
    it('should return error', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      expect(instance.getPaymentFailureStatus()).toBe('FAILURE');
    });
  });

  // given
  describe('onPaymentCanceled()', () => {
    // then
    it('should oncancel handler has been set', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      Object.defineProperty(instance._session, 'oncancel', { value: '', writable: true });
      // @ts-ignore
      instance._onPaymentCanceled();
      // @ts-ignore
      expect(getType(instance._session.oncancel)).toBe('function');

      // @ts-ignore
      instance._notification.cancel = jest.fn();
      // @ts-ignore
      instance._session.oncancel({});
      // @ts-ignore
      expect(instance._notification.cancel).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._notification.cancel).toHaveBeenCalledWith('Payment has been cancelled');
    });
  });
  // given
  describe('_onValidateMerchantResponseSuccess()', () => {
    // then
    it('should call _onValidateMerchantResponseSuccess if walletsession is not set ', () => {
      const response = { walletsession: '' };
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      instance._session.abort = jest.fn();
      // @ts-ignore
      const spy = jest.spyOn(instance, '_onValidateMerchantResponseSuccess');
      // @ts-ignore
      instance._onValidateMerchantResponseSuccess(response);
      expect(spy).toHaveBeenCalled();
    });

    // then
    it('should set merchantSession if walletsession is set and call _session.completeMerchantValidation with merchantSession', () => {
      const response = { walletsession: '{"someproperty":"somewalletsession"}' };
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance._session = {
        abort: jest.fn(),
        completeMerchantValidation: jest.fn()
      };
      // @ts-ignore
      instance._onValidateMerchantResponseSuccess(response);
      // @ts-ignore
      expect(instance._merchantSession).toEqual({ someproperty: 'somewalletsession' });
      // @ts-ignore
      expect(instance._session.completeMerchantValidation).toHaveBeenCalledWith({ someproperty: 'somewalletsession' });
    });
  });
  // given
  describe('_onValidateMerchantResponseFailure()', () => {
    // then
    it('should setNotification has been called', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      const spy = jest.spyOn(instance, '_onValidateMerchantResponseFailure');
      // @ts-ignore
      instance._session = {};
      // @ts-ignore
      instance._session.abort = jest.fn();
      // @ts-ignore
      instance._onValidateMerchantResponseFailure('some error');
      expect(spy).toHaveBeenCalled();
    });
  });

  // given
  describe('subscribeStatusHandlers()', () => {
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
      instance._session = sessionObjectFake;
      instance._paymentRequest = { total: { amount: '10.00', label: 'someLabel' } };
    });
    // then
    it('should set callback functions', () => {
      instance._subscribeStatusHandlers();
      expect(instance._session.onpaymentmethodselected).toBeInstanceOf(Function);
      expect(instance._session.onshippingcontactselected).toBeInstanceOf(Function);
      expect(instance._session.onshippingmethodselected).toBeInstanceOf(Function);
    });

    // then
    it('calling onpaymentmethodselected should call completePaymentMethodSelection', () => {
      instance._subscribeStatusHandlers();
      instance._session.onpaymentmethodselected({ paymentMethod: 'MYMETHOD' });
      expect(instance._session.completePaymentMethodSelection).toHaveBeenCalledTimes(1);
      expect(instance._session.completePaymentMethodSelection).toHaveBeenCalledWith({
        newTotal: {
          amount: '10.00',
          label: 'someLabel',
          type: 'final'
        }
      });
      expect(instance._session.completeShippingMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance._session.completeShippingContactSelection).toHaveBeenCalledTimes(0);
    });
    // then
    it('calling onshippingmethodselected should call completeShippingMethodSelection', () => {
      instance._subscribeStatusHandlers();
      instance._session.onshippingmethodselected({ paymentMethod: 'MYMETHOD' });
      expect(instance._session.completePaymentMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance._session.completeShippingMethodSelection).toHaveBeenCalledTimes(1);
      expect(instance._session.completeShippingMethodSelection).toHaveBeenCalledWith({
        newTotal: {
          amount: '10.00',
          label: 'someLabel',
          type: 'final'
        }
      });
      expect(instance._session.completeShippingContactSelection).toHaveBeenCalledTimes(0);
    });
    // then
    it('calling onshippingmethodselected should call completeShippingContactSelection', () => {
      instance._subscribeStatusHandlers();
      instance._session.onshippingcontactselected({ paymentMethod: 'MYMETHOD' });
      expect(instance._session.completePaymentMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance._session.completeShippingMethodSelection).toHaveBeenCalledTimes(0);
      expect(instance._session.completeShippingContactSelection).toHaveBeenCalledTimes(1);
      expect(instance._session.completeShippingContactSelection).toHaveBeenCalledWith({
        newTotal: {
          amount: '10.00',
          label: 'someLabel',
          type: 'final'
        }
      });
    });
  });

  // given
  describe('paymentProcess()', () => {
    let sessionObjectFake: object;
    beforeEach(() => {
      sessionObjectFake = { begin: jest.fn() };
    });

    // then
    it('should call correct functions', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance.getApplePaySessionObject = jest.fn().mockReturnValueOnce(sessionObjectFake);
      // @ts-ignore
      instance._onValidateMerchantRequest = jest.fn();
      // @ts-ignore
      instance._subscribeStatusHandlers = jest.fn();
      // @ts-ignore
      instance._onPaymentAuthorized = jest.fn();
      // @ts-ignore
      instance._onPaymentCanceled = jest.fn();

      // @ts-ignore
      instance._paymentProcess();
      // @ts-ignore
      expect(instance.getApplePaySessionObject).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._onValidateMerchantRequest).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._subscribeStatusHandlers).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._onPaymentAuthorized).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._onPaymentCanceled).toHaveBeenCalled();

      // @ts-ignore
      expect(instance._session.begin).toHaveBeenCalled();
    });
  });

  // given
  describe('applePayProcess()', () => {
    // then
    it('should do nothing if isUserLoggedToAppleAccount returns false', () => {
      const { instance } = ApplePayFixture();
      // @ts-ignore
      instance.isUserLoggedToAppleAccount = jest.fn().mockReturnValueOnce(false);
      // @ts-ignore
      instance.checkApplePayWalletCardAvailability = jest.fn();
      // @ts-ignore
      instance._applePayProcess();
      // @ts-ignore
      expect(instance.isUserLoggedToAppleAccount).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance.checkApplePayWalletCardAvailability).not.toHaveBeenCalled();
    });
    // then
    it('should call only canMakePayments if isUserLoggedToAppleAccount returns true and canMakePayments returns false', async () => {
      const { instance } = ApplePayFixture();
      jest.resetAllMocks();
      // @ts-ignore
      jest.spyOn(instance, 'isUserLoggedToAppleAccount').mockReturnValueOnce(true);
      // @ts-ignore
      jest.spyOn(instance, 'checkApplePayWalletCardAvailability').mockReturnValue(
        new Promise(function (resolve, reject) {
          resolve(false);
        })
      );
      // @ts-ignore
      jest.spyOn(instance, '_applePayButtonClickHandler');
      // @ts-ignore
      await instance._applePayProcess();
      // @ts-ignore
      expect(instance.checkApplePayWalletCardAvailability).toHaveBeenCalled();
    });

    // then
    it('should call applePayButtonClickHandler if isUserLoggedToAppleAccount returns true and canMakePayments returns true', async () => {
      const { instance } = ApplePayFixture();
      jest.resetAllMocks();
      // @ts-ignore
      jest.spyOn(instance, 'isUserLoggedToAppleAccount').mockReturnValueOnce(true);
      // @ts-ignore
      jest.spyOn(instance, 'checkApplePayWalletCardAvailability').mockReturnValue(
        new Promise(function (resolve, reject) {
          resolve(true);
        })
      );
      // @ts-ignore
      jest.spyOn(instance, '_applePayButtonClickHandler');
      // @ts-ignore
      await instance._applePayProcess();
      // @ts-ignore
      expect(instance.checkApplePayWalletCardAvailability).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._applePayButtonClickHandler).toHaveBeenCalled();
    });
  });

  // given
  describe('_displayNotification()', () => {
    const { instance } = ApplePayFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._notification.success = jest.fn();
      // @ts-ignore
      instance._notification.error = jest.fn();
    });

    // then
    it('should call success notification when errorcode is equal 0', () => {
      // @ts-ignore
      instance._displayNotification('0', Language.translations.PAYMENT_SUCCESS);
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledWith(Language.translations.PAYMENT_SUCCESS);
    });

    // then
    it('should call error notification when errorcode is not equal 0', () => {
      // @ts-ignore
      instance._displayNotification('30000', Language.translations.PAYMENT_ERROR);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith(Language.translations.PAYMENT_ERROR);
    });
  });

  // given
  describe('_handleApplePayError()', () => {
    const errorObject = { errorcode: '', errormessage: 'Some error message', data: {} };
    const { instance } = ApplePayFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance.getPaymentSuccessStatus = jest.fn();
      // @ts-ignore
      instance.getPaymentFailureStatus = jest.fn();
      // @ts-ignore
      instance._translator.translate = jest.fn();
    });

    // then
    it(`should call getPaymentSuccessStatus() when browser doesn't support ApplePay version and error code equals 0`, () => {
      errorObject.errorcode = '0';
      // @ts-ignore
      instance._ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(false);
      // @ts-ignore
      instance._handleApplePayError(errorObject);
      // @ts-ignore
      expect(instance.getPaymentSuccessStatus).toHaveBeenCalledTimes(1);
    });

    // then
    it(`should call getPaymentFailureStatus() when browser doesn't support ApplePay version and error code equals 30000`, () => {
      errorObject.errorcode = '30000';
      // @ts-ignore
      instance._ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(false);
      // @ts-ignore
      instance._handleApplePayError(errorObject);
      // @ts-ignore
      expect(instance.getPaymentFailureStatus).toHaveBeenCalledTimes(1);
    });
    // then
    it(`should call _translator.translate() when browser supports ApplePay version and error code equals 30000`, () => {
      errorObject.errorcode = '30000';
      // @ts-ignore
      instance._ifBrowserSupportsApplePayVersion = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance._handleApplePayError(errorObject);
      // @ts-ignore
      expect(instance._translator.translate).toHaveBeenCalledWith(errorObject.errormessage);
    });
  });

  // given
  describe('_addButtonHandler()', () => {
    const { instance } = ApplePayFixture();
    // @ts-ignore
    const id: string = ApplePay.APPLE_PAY_BUTTON_ID;
    const fakeId: string = 'blah';
    const event: string = 'click';
    const message: string = Language.translations.APPLE_PAY_NOT_LOGGED;

    // then
    it(`should call notification with success if notification type is success`, () => {
      document.getElementById(id).addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance._notification.success = jest.fn();
      // @ts-ignore
      instance._addButtonHandler(id, event, 'success', message);
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledWith(message);
    });

    // then
    it(`should call notification with error if notification type is error`, () => {
      document.getElementById(id).addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._addButtonHandler(id, event, 'error', message);
      // @ts-ignore
      expect(instance._notification.error).toHaveBeenCalledWith(message);
    });

    // then
    it(`should call notification with cancel if notification type is cancel`, () => {
      document.getElementById(id).addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance._notification.cancel = jest.fn();
      // @ts-ignore
      instance._addButtonHandler(id, event, 'cancel', message);
      // @ts-ignore
      expect(instance._notification.cancel).toHaveBeenCalledWith(message);
    });

    // then
    it(`should call notification with info if notification type is different than previous`, () => {
      document.getElementById(id).addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance._notification.info = jest.fn();
      // @ts-ignore
      instance._addButtonHandler(id, event, 'info', message);
      // @ts-ignore
      expect(instance._notification.info).toHaveBeenCalledWith(message);
    });

    // then
    it(`should return false if element doesn't exist`, () => {
      // @ts-ignore
      expect(instance._addButtonHandler('somerandomid', event, 'info', message)).toEqual(false);
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
  const configProvider = mock(ConfigProvider);
  const communicator = mock(InterFrameCommunicator);
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';

  when(communicator.whenReceive(anyString())).thenReturn({
    thenRespond: () => EMPTY
  });
  when(configProvider.getConfig$()).thenReturn(of({ jwt, disableNotification: false, applePay: config }));
  const instance = new ApplePay(mockInstance(configProvider), mockInstance(communicator));

  return {
    config,
    jwt,
    instance
  };
}
