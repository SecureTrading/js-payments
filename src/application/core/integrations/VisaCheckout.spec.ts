import { VisaCheckout } from './VisaCheckout';
import { anyString, mock, when, instance as mockInstance } from 'ts-mockito';
import { ConfigProvider } from '../services/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { EMPTY, of } from 'rxjs';

jest.mock('../../../../src/application/core/integrations/GoogleAnalytics');
jest.mock('../../../../src/application/core/shared/Notification');

// given
describe('Visa Checkout', () => {
  let body: object;
  let instance: any;
  const configProvider = mock(ConfigProvider);
  const communicator = mock(InterFrameCommunicator);
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  // when
  beforeEach(() => {
    when(communicator.whenReceive(anyString())).thenReturn({
      thenRespond: () => EMPTY
    });
    when(configProvider.getConfig$()).thenReturn(
      of({
        jwt,
        disableNotification: false,
        datacenterurl: 'https://example.com',
        visaCheckout: {
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
          requestTypes: ['AUTH'],
          settings: {
            displayName: 'My Test Site'
          }
        }
      })
    );
    instance = new VisaCheckout(mockInstance(configProvider), mockInstance(communicator));
    body = document.body;
  });

  // given
  describe('setInitConfiguration()', () => {
    // then
    it('should set _initConfiguration', () => {
      instance._initConfiguration = { start: 'with value', paymentRequest: {} };
      instance.setInitConfiguration(
        { payment: 'request' },
        { settings: 'abc' },
        { locale: 'es_ES', mainamount: '10.00' },
        'myapi'
      );
      expect(instance._initConfiguration).toMatchObject({
        paymentRequest: { currencyCode: undefined, payment: 'request', subtotal: '10.00', total: '10.00' },
        settings: { settings: 'abc', locale: 'es_ES' },
        apikey: 'myapi',
        start: 'with value'
      });
    });
  });

  // given
  describe('set and get payment', () => {
    // then
    it('should set and get the payment attribute', () => {
      instance.payment = { myKey: 'some value' };
      expect(instance.payment).toStrictEqual({ myKey: 'some value' });
      expect(instance._payment).toStrictEqual({ myKey: 'some value' });
    });
  });

  // given
  describe('getInitPaymentRequest()', () => {
    // then
    it('should return paymentRequest config', () => {
      instance._initConfiguration.paymentRequest = { original: 'data', overrideMe: 'unchanged' };
      const result = instance.getInitPaymentRequest(
        { payment: 'request', overrideMe: 'overridden' },
        { locale: 'es_ES', mainamount: '10.00', currencyiso3a: 'GBP' }
      );
      expect(result).toMatchObject({
        currencyCode: 'GBP',
        original: 'data',
        overrideMe: 'overridden',
        payment: 'request',
        subtotal: '10.00',
        total: '10.00'
      });
    });
    //then
    it('should handle undefined paymentRequest', () => {
      instance._initConfiguration.paymentRequest = { original: 'data', overrideMe: 'unchanged' };
      const result = instance.getInitPaymentRequest(undefined, {
        currencyiso3a: 'GBP',
        locale: 'es_ES',
        mainamount: '10.00'
      });
      expect(result).toMatchObject({
        currencyCode: 'GBP',
        original: 'data',
        overrideMe: 'unchanged',
        subtotal: '10.00',
        total: '10.00'
      });
    });
  });

  // given
  describe('setConfiguration()', () => {
    // then
    it('should return configuration', () => {
      const result = instance._setConfiguration(
        { payment: 'request', another: 'value' },
        { locale: 'es_ES', mainamount: '10.00', currencyiso3a: 'GBP' }
      );
      expect(result).toMatchObject({ locale: 'es_ES', payment: 'request', another: 'value' });
    });
    // then
    it('should handle undefined config', () => {
      const result = instance._setConfiguration(undefined, {
        currencyiso3a: 'GBP',
        locale: 'es_ES',
        mainamount: '10.00'
      });
      expect(result).toMatchObject({
        currencyiso3a: 'GBP',
        locale: 'es_ES',
        mainamount: '10.00'
      });
    });

    // then
    it('should handle undefined settings', () => {
      const result = instance._setConfiguration({ payment: 'request', another: 'value' }, undefined);
      expect(result).toMatchObject({ payment: 'request', another: 'value' });
    });
    // then
    it('should handle undefined both', () => {
      const result = instance._setConfiguration(undefined, undefined);
      expect(result).toMatchObject({});
    });
  });

  // given
  describe('createVisaButton()', () => {
    const { fakeVisaButton } = VisaCheckoutFixture();

    // then
    it('should button be defined', () => {
      expect(instance.createVisaButton()).toBeDefined();
    });

    // then
    it('should img markup have certain attributes', () => {
      expect(instance.createVisaButton()).toMatchObject(fakeVisaButton);
    });
  });

  // given
  describe('_initVisaConfiguration()', () => {
    // then
    let sdkMarkup: object;
    beforeEach(() => {
      sdkMarkup = VisaCheckoutFixture().sdkMarkup;
    });
    it('should init script on button', () => {});
    // then
    it('should triggers paymentStatusHandler for each status (cancel, error, success)', () => {});
  });

  // given
  describe('attachVisaButton()', () => {
    // then
    it('should prepared structure be equal to real document object ', () => {
      expect(instance.attachVisaButton()).toEqual(body);
    });
  });

  // given
  describe('_setLiveStatus()', () => {
    // then
    it('should set sandbox assets when application is not live', () => {
      const { sandboxAssets } = VisaCheckoutFixture();
      instance._setLiveStatus();
      expect(instance.visaCheckoutButtonProps.src).toEqual(sandboxAssets.buttonImg);
      expect(instance._sdkAddress).toEqual(sandboxAssets.sdk);
    });
    it('should set production assets when application is live', () => {
      const { productionAssets } = VisaCheckoutFixture();
      instance._livestatus = 1;
      instance._setLiveStatus();
      expect(instance.visaCheckoutButtonProps.src).toEqual(productionAssets.buttonImg);
      expect(instance._sdkAddress).toEqual(productionAssets.sdk);
    });
  });

  // given
  describe('_initVisaFlow()', () => {
    // @ts-ignore
    const initPayment = VisaCheckout.prototype.initPaymentConfiguration;
    // @ts-ignore
    const statusHandler = VisaCheckout.prototype.paymentStatusHandler;

    // then
    it.skip('should call load handler', () => {
      // @ts-ignore
      const spy = jest.spyOn(VisaCheckout.prototype, 'initPaymentConfiguration').mockImplementation(() => {});
      // @ts-ignore
      const spy2 = jest.spyOn(VisaCheckout.prototype, 'paymentStatusHandler').mockImplementation(() => {});
      const ev = document.createEvent('Event');
      ev.initEvent('load', false, false);
      const script = document.getElementsByTagName('script')[0];
      script.dispatchEvent(ev);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      // @ts-ignore
      VisaCheckout.prototype.initPaymentConfiguration = initPayment;
      // @ts-ignore
      VisaCheckout.prototype.paymentStatusHandler = statusHandler;
    });
  });

  describe('paymentStatusHandler()', () => {
    // then
    it('should trigger V.on functions with proper configuration', () => {
      const { fakeV } = VisaCheckoutFixture();
      // @ts-ignore
      global.V = fakeV;
      instance.paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(fakeV.on.mock.calls[0].length).toBe(2);
      expect(fakeV.on.mock.calls[0][0]).toBe('payment.success');
      expect(fakeV.on.mock.calls[0][1]).toBeInstanceOf(Function);
      expect(fakeV.on.mock.calls[1].length).toBe(2);
      expect(fakeV.on.mock.calls[1][0]).toBe('payment.error');
      expect(fakeV.on.mock.calls[1][1]).toBeInstanceOf(Function);
      expect(fakeV.on.mock.calls[2].length).toBe(2);
      expect(fakeV.on.mock.calls[2][0]).toBe('payment.cancel');
      expect(fakeV.on.mock.calls[2][1]).toBeInstanceOf(Function);
    });
    // then
    it('should trigger V.on payment.success and call onSuccess', () => {
      instance.onSuccess = jest.fn();
      instance.onError = jest.fn();
      instance.onCancel = jest.fn();
      const { fakeV } = VisaCheckoutFixture();
      fakeV.on = jest.fn((eventType, callback) => {
        if (eventType === 'payment.success') {
          callback({ myPayment: 'some value' });
        }
      });
      // @ts-ignore
      global.V = fakeV;
      instance.paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(instance.onSuccess).toHaveBeenCalledTimes(1);
      expect(instance.onSuccess).toHaveBeenCalledWith({ myPayment: 'some value' });
      expect(instance.onError).toHaveBeenCalledTimes(0);
      expect(instance.onCancel).toHaveBeenCalledTimes(0);
    });
    // then
    it('should trigger V.on payment.error and call _onError', () => {
      instance.onSuccess = jest.fn();
      instance.onError = jest.fn();
      instance.onCancel = jest.fn();
      const { fakeV } = VisaCheckoutFixture();
      fakeV.on = jest.fn((eventType, callback) => {
        if (eventType === 'payment.error') {
          callback({ myPayment: 'some value' });
        }
      });
      // @ts-ignore
      global.V = fakeV;
      instance.paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(instance.onSuccess).toHaveBeenCalledTimes(0);
      expect(instance.onError).toHaveBeenCalledTimes(1);
      expect(instance.onError).toHaveBeenCalledWith();
      expect(instance.onCancel).toHaveBeenCalledTimes(0);
    });
    // then
    it('should trigger V.on payment.cancel and call onCancel', () => {
      instance.onSuccess = jest.fn();
      instance.onError = jest.fn();
      instance.onCancel = jest.fn();
      const { fakeV } = VisaCheckoutFixture();
      fakeV.on = jest.fn((eventType, callback) => {
        if (eventType === 'payment.cancel') {
          callback({ myPayment: 'some value' });
        }
      });
      // @ts-ignore
      global.V = fakeV;
      instance.paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(instance.onSuccess).toHaveBeenCalledTimes(0);
      expect(instance.onError).toHaveBeenCalledTimes(0);
      expect(instance.onCancel).toHaveBeenCalledTimes(1);
      expect(instance.onCancel).toHaveBeenCalledWith();
    });
  });

  // given
  describe('initPaymentConfiguration()', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {
      const { fakeV } = VisaCheckoutFixture();
      // @ts-ignore
      global.V = fakeV;
      instance._initConfiguration = { myDummy: 'config' };
      instance.initPaymentConfiguration();
      expect(fakeV.init).toHaveBeenCalledTimes(1);
      expect(fakeV.init).toHaveBeenCalledWith(instance._initConfiguration);
    });
  });

  // given
  describe('customizeVisaButton()', () => {
    // then
    it('should handle no color or size', () => {
      const { url } = VisaCheckoutFixture();
      instance.visaCheckoutButtonProps.src = url;
      const resp = instance.customizeVisaButton({});
      expect(resp).toBe(`${url}/`);
    });
    // then
    it('should set color', () => {
      const { url } = VisaCheckoutFixture();
      instance.visaCheckoutButtonProps.src = url;
      const resp = instance.customizeVisaButton({ color: 'neutral' });
      expect(resp).toBe(`${url}/?color=neutral`);
    });
    // then
    it('should set size', () => {
      const { url } = VisaCheckoutFixture();
      instance.visaCheckoutButtonProps.src = url;
      const resp = instance.customizeVisaButton({ size: '154' });
      expect(resp).toBe(`${url}/?size=154`);
    });
    // then
    it('should set color and size', () => {
      const { url } = VisaCheckoutFixture();
      instance.visaCheckoutButtonProps.src = url;
      const resp = instance.customizeVisaButton({ color: 'neutral', size: '154' });
      expect(resp).toBe(`${url}/?color=neutral&size=154`);
    });
  });
  // given
  describe('onSuccess()', () => {
    // then
    it('should set paymentDetails and paymentStatus and call _processPayment', () => {
      instance.payment.processPayment = jest.fn().mockReturnValue(new Promise(resolve => resolve()));
      const payment = { status: 'SUCCESS', another: 'value' };
      instance.onSuccess(payment);
      expect(instance.paymentDetails).toBe('{"status":"SUCCESS","another":"value"}');
      expect(instance.paymentStatus).toBe('SUCCESS');
      expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('_onError()', () => {
    // then
    it('should set paymentStatus and call _getResponseMessage and _setNotification', () => {
      instance._getResponseMessage = jest.fn();
      instance._notification.error = jest.fn();
      instance.responseMessage = 'MY MESSAGE';
      instance.onError();
      expect(instance.paymentStatus).toBe('ERROR');
      expect(instance._getResponseMessage).toHaveBeenCalledTimes(1);
      expect(instance._getResponseMessage).toHaveBeenCalledWith('ERROR');
      expect(instance._notification.error).toHaveBeenCalledTimes(1);
      expect(instance._notification.error).toHaveBeenCalledWith('MY MESSAGE');
    });
  });

  // given
  describe('onCancel()', () => {
    // then
    it('should set paymentStatus and call __getResponseMessage and _setNotification', () => {
      instance._getResponseMessage = jest.fn();
      instance._notification.cancel = jest.fn();
      instance.responseMessage = 'MY MESSAGE';
      instance.onCancel();
      expect(instance.paymentStatus).toBe('WARNING');
      expect(instance._getResponseMessage).toHaveBeenCalledTimes(1);
      expect(instance._getResponseMessage).toHaveBeenCalledWith('WARNING');
      expect(instance._notification.cancel).toHaveBeenCalledTimes(1);
      expect(instance._notification.cancel).toHaveBeenCalledWith('MY MESSAGE');
    });
  });

  // given
  describe('_getResponseMessage()', () => {
    // then
    it('should set responseMessage on success', () => {
      instance._getResponseMessage('SUCCESS');
      expect(instance.responseMessage).toBe('Payment has been successfully processed');
    });
    // then
    it('should set responseMessage on success', () => {
      instance._getResponseMessage('ERROR');
      expect(instance.responseMessage).toBe('An error occurred');
    });
    // then
    it('should set responseMessage on success', () => {
      instance._getResponseMessage('WARNING');
      expect(instance.responseMessage).toBe('Payment has been cancelled');
    });
    // then
    it('should not set responseMessage on unknown', () => {
      instance._getResponseMessage('UNKNOWN');
      expect(instance.responseMessage).toBe(undefined);
    });
  });

  // then
  it('should process CACHETOKEN call getResponseMessage and setNotification for success with tokenise true', () => {
    instance.payment.processPayment = jest
      .fn()
      .mockResolvedValueOnce({ response: { myData: 'respData' }, jwt: 'ajwtvalue' });
    instance._getResponseMessage = jest.fn();
    instance._notification.success = jest.fn();
    instance.responseMessage = 'MYRESPONSE';
    instance.requestTypes = ['CACHETOKENISE'];
    instance._walletSource = 'VISACHECKOUT';
    instance.paymentDetails = 'TOKEN';
    instance.onSuccess({ token: 'TOKEN' });
    expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
    expect(instance.payment.processPayment).toHaveBeenCalledWith(
      ['CACHETOKENISE'],
      { walletsource: 'VISACHECKOUT', wallettoken: '{"token":"TOKEN"}' },
      {}
    );
  });

  // then
  it('should process AUTH call getResponseMessage and setNotification for error with tokenise false', () => {
    instance.payment.processPayment = jest
      .fn()
      .mockRejectedValueOnce({ response: { myData: 'respData' }, jwt: 'ajwtvalue' });
    instance._getResponseMessage = jest.fn();
    instance._notification.error = jest.fn();
    instance.responseMessage = 'MYRESPONSE';
    instance._walletSource = 'VISACHECKOUT';
    instance.paymentDetails = 'TOKEN';
    instance.onSuccess({ token: 'TOKEN' });
    expect(instance.payment.processPayment).toHaveBeenCalledTimes(1);
    expect(instance.payment.processPayment).toHaveBeenCalledWith(
      ['AUTH'],
      { walletsource: 'VISACHECKOUT', wallettoken: '{"token":"TOKEN"}' },
      {}
    );
  });
});

function VisaCheckoutFixture() {
  const html = '<form id="st-form"><button id="v-button" /></form>';
  document.body.innerHTML = html;

  const visaButttonProps = {
    alt: 'Visa Checkout',
    class: 'v-button',
    role: 'button',
    src: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };
  const config = {
    name: 'VISA',
    merchantId: '2ig278`13b123872121h31h20e',
    buttonSettings: { size: '154', color: 'neutral' },
    settings: { displayName: 'My Test Site' },
    paymentRequest: { subtotal: '20.00' },
    requestTypes: ['AUTH']
  };
  const productionAssets = {
    sdk: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    buttonImg: `https://secure.checkout.visa.com/wallet-services-web/xo/button.png`
  };
  const sandboxAssets = {
    sdk: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    buttonImg: `https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png?color=${config.buttonSettings.color}&size=${config.buttonSettings.size}`
  };
  const livestatus: number = 0;
  const fakeVisaButton = document.createElement('img');
  fakeVisaButton.setAttribute('src', visaButttonProps.src);
  fakeVisaButton.setAttribute('class', visaButttonProps.class);
  fakeVisaButton.setAttribute('role', visaButttonProps.role);
  fakeVisaButton.setAttribute('alt', visaButttonProps.alt);

  const sdkMarkup = document.createElement('script');
  sdkMarkup.setAttribute(
    'src',
    'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js'
  );
  const url = 'https://example.com';
  const fakeV = { init: jest.fn(), on: jest.fn() };

  return { config, fakeVisaButton, livestatus, sdkMarkup, productionAssets, sandboxAssets, fakeV, url };
}
