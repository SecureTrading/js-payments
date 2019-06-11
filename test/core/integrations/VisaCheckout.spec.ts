import VisaCheckout from '../../../src/core/integrations/VisaCheckout';

// given
describe('Visa Checkout class', () => {
  let body: object;
  let instance: any;
  // when
  beforeEach(() => {
    const { config } = VisaCheckoutFixture();
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
    instance = new VisaCheckout(config, false, jwt, 'https://example.com');
    body = document.body;
  });

  // given
  describe('_setInitConfiguration()', () => {
    // then
    it('should set _initConfiguration', () => {
      instance._initConfiguration = { start: 'with value', paymentRequest: {} };
      instance._setInitConfiguration(
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
  describe('_getInitPaymentRequest()', () => {
    // then
    it('should return paymentRequest config', () => {
      instance._initConfiguration.paymentRequest = { original: 'data', overrideMe: 'unchanged' };
      const result = instance._getInitPaymentRequest(
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
      const result = instance._getInitPaymentRequest(undefined, {
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
      const result = instance.setConfiguration(
        { payment: 'request', another: 'value' },
        { locale: 'es_ES', mainamount: '10.00', currencyiso3a: 'GBP' }
      );
      expect(result).toMatchObject({ locale: 'es_ES', payment: 'request', another: 'value' });
    });
    // then
    it('should handle undefined config', () => {
      const result = instance.setConfiguration(undefined, {
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
      const result = instance.setConfiguration({ payment: 'request', another: 'value' }, undefined);
      expect(result).toMatchObject({ payment: 'request', another: 'value' });
    });
  });

  // given
  describe('_createVisaButton()', () => {
    const { fakeVisaButton } = VisaCheckoutFixture();

    // then
    it('should button be defined', () => {
      expect(instance._createVisaButton()).toBeDefined();
    });

    // then
    it('should img markup have certain attributes', () => {
      expect(instance._createVisaButton()).toMatchObject(fakeVisaButton);
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
    it('should triggers _paymentStatusHandler for each status (cancel, error, success)', () => {});
  });

  // given
  describe('_attachVisaButton()', () => {
    // then
    it('should prepared structure be equal to real document object ', () => {
      expect(instance._attachVisaButton()).toEqual(body);
    });
  });

  // given
  describe('_setLiveStatus()', () => {
    // then
    it('should set sandbox assets when application is not live', () => {
      const { sandboxAssets } = VisaCheckoutFixture();
      instance._setLiveStatus();
      expect(instance._visaCheckoutButtonProps.src).toEqual(sandboxAssets.buttonImg);
      expect(instance._sdkAddress).toEqual(sandboxAssets.sdk);
    });
    it('should set production assets when application is live', () => {
      const { productionAssets } = VisaCheckoutFixture();
      instance._livestatus = 1;
      instance._setLiveStatus();
      expect(instance._visaCheckoutButtonProps.src).toEqual(productionAssets.buttonImg);
      expect(instance._sdkAddress).toEqual(productionAssets.sdk);
    });
  });

  // given
  describe('_initVisaFlow()', () => {
    // @ts-ignore
    const initPayment = VisaCheckout.prototype._initPaymentConfiguration;
    // @ts-ignore
    const statusHandler = VisaCheckout.prototype._paymentStatusHandler;

    // then
    it('should call load handler', () => {
      // @ts-ignore
      const spy = jest.spyOn(VisaCheckout.prototype, '_initPaymentConfiguration').mockImplementation(() => {});
      // @ts-ignore
      const spy2 = jest.spyOn(VisaCheckout.prototype, '_paymentStatusHandler').mockImplementation(() => {});
      instance._initVisaFlow();
      const ev = document.createEvent('Event');
      ev.initEvent('load', false, false);
      const script = document.getElementsByTagName('script')[0];
      script.dispatchEvent(ev);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      // @ts-ignore
      VisaCheckout.prototype._initPaymentConfiguration = initPayment;
      // @ts-ignore
      VisaCheckout.prototype._paymentStatusHandler = statusHandler;
    });
  });

  describe('_paymentStatusHandler()', () => {
    // then
    it('should trigger V.on functions with proper configuration', () => {
      const { fakeV } = VisaCheckoutFixture();
      // @ts-ignore
      global.V = fakeV;
      instance._paymentStatusHandler();
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
    it('should trigger V.on payment.success and call _onSuccess', () => {
      instance._onSuccess = jest.fn();
      instance._onError = jest.fn();
      instance._onCancel = jest.fn();
      const { fakeV } = VisaCheckoutFixture();
      fakeV.on = jest.fn((eventType, callback) => {
        if (eventType === 'payment.success') {
          callback({ myPayment: 'some value' });
        }
      });
      // @ts-ignore
      global.V = fakeV;
      instance._paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(instance._onSuccess).toHaveBeenCalledTimes(1);
      expect(instance._onSuccess).toHaveBeenCalledWith({ myPayment: 'some value' });
      expect(instance._onError).toHaveBeenCalledTimes(0);
      expect(instance._onCancel).toHaveBeenCalledTimes(0);
    });
    // then
    it('should trigger V.on payment.error and call _onError', () => {
      instance._onSuccess = jest.fn();
      instance._onError = jest.fn();
      instance._onCancel = jest.fn();
      const { fakeV } = VisaCheckoutFixture();
      fakeV.on = jest.fn((eventType, callback) => {
        if (eventType === 'payment.error') {
          callback({ myPayment: 'some value' });
        }
      });
      // @ts-ignore
      global.V = fakeV;
      instance._paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(instance._onSuccess).toHaveBeenCalledTimes(0);
      expect(instance._onError).toHaveBeenCalledTimes(1);
      expect(instance._onError).toHaveBeenCalledWith();
      expect(instance._onCancel).toHaveBeenCalledTimes(0);
    });
    // then
    it('should trigger V.on payment.cancel and call _onCancel', () => {
      instance._onSuccess = jest.fn();
      instance._onError = jest.fn();
      instance._onCancel = jest.fn();
      const { fakeV } = VisaCheckoutFixture();
      fakeV.on = jest.fn((eventType, callback) => {
        if (eventType === 'payment.cancel') {
          callback({ myPayment: 'some value' });
        }
      });
      // @ts-ignore
      global.V = fakeV;
      instance._paymentStatusHandler();
      expect(fakeV.on).toHaveBeenCalledTimes(3);
      expect(instance._onSuccess).toHaveBeenCalledTimes(0);
      expect(instance._onError).toHaveBeenCalledTimes(0);
      expect(instance._onCancel).toHaveBeenCalledTimes(1);
      expect(instance._onCancel).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_initPaymentConfiguration()', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {
      const { fakeV } = VisaCheckoutFixture();
      // @ts-ignore
      global.V = fakeV;
      instance._initConfiguration = { myDummy: 'config' };
      instance._initPaymentConfiguration();
      expect(fakeV.init).toHaveBeenCalledTimes(1);
      expect(fakeV.init).toHaveBeenCalledWith(instance._initConfiguration);
    });
  });

  // given
  describe('setNotification()', () => {
    // then
    it('', () => {});
  });
  // given
  describe('_onSuccess()', () => {
    // then
    it('should set paymentDetails and paymentStatus and call _processPayment', () => {
      instance._processPayment = jest.fn();
      const payment = { status: 'SUCCESS', another: 'value' };
      instance._onSuccess(payment);
      expect(instance.paymentDetails).toBe('{"status":"SUCCESS","another":"value"}');
      expect(instance.paymentStatus).toBe('SUCCESS');
      expect(instance._processPayment).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('_onError()', () => {
    // then
    it('should set paymentStatus and call _getResponseMessage and _setNotification', () => {
      instance.getResponseMessage = jest.fn();
      instance.setNotification = jest.fn();
      instance.responseMessage = 'MY MESSAGE';
      instance._onError();
      expect(instance.paymentStatus).toBe('ERROR');
      expect(instance.getResponseMessage).toHaveBeenCalledTimes(1);
      expect(instance.getResponseMessage).toHaveBeenCalledWith('ERROR');
      expect(instance.setNotification).toHaveBeenCalledTimes(1);
      expect(instance.setNotification).toHaveBeenCalledWith('ERROR', 'MY MESSAGE');
    });
  });

  // given
  describe('_onCancel()', () => {
    // then
    it('should set paymentStatus and call _getResponseMessage and _setNotification', () => {
      instance.getResponseMessage = jest.fn();
      instance.setNotification = jest.fn();
      instance.responseMessage = 'MY MESSAGE';
      instance._onCancel();
      expect(instance.paymentStatus).toBe('WARNING');
      expect(instance.getResponseMessage).toHaveBeenCalledTimes(1);
      expect(instance.getResponseMessage).toHaveBeenCalledWith('WARNING');
      expect(instance.setNotification).toHaveBeenCalledTimes(1);
      expect(instance.setNotification).toHaveBeenCalledWith('WARNING', 'MY MESSAGE');
    });
  });

  // given
  describe('getResponseMessage()', () => {
    // then
    it('should set responseMessage on success', () => {
      instance.getResponseMessage('SUCCESS');
      expect(instance.responseMessage).toBe('Payment has been successfully processed');
    });
    // then
    it('should set responseMessage on success', () => {
      instance.getResponseMessage('ERROR');
      expect(instance.responseMessage).toBe('An error occurred');
    });
    // then
    it('should set responseMessage on success', () => {
      instance.getResponseMessage('WARNING');
      expect(instance.responseMessage).toBe('Payment has been cancelled');
    });
    // then
    it('should not set responseMessage on unknown', () => {
      instance.getResponseMessage('UNKNOWN');
      expect(instance.responseMessage).toBe(undefined);
    });
  });
});

function VisaCheckoutFixture() {
  const visaButttonProps = {
    alt: 'Visa Checkout',
    class: 'v-button',
    role: 'button',
    src: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };
  const config = {
    name: 'VISA',
    livestatus: 0,
    merchantId: '2ig278`13b123872121h31h20e',
    buttonSettings: { size: '154', color: 'neutral' },
    settings: { displayName: 'My Test Site' },
    paymentRequest: { subtotal: '20.00' }
  };
  const productionAssets = {
    sdk: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    buttonImg: `https://secure.checkout.visa.com/wallet-services-web/xo/button.png`
  };
  const sandboxAssets = {
    sdk: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    buttonImg: `https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png?color=${
      config.buttonSettings.color
    }&size=${config.buttonSettings.size}`
  };
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

  const fakeV = { init: jest.fn(), on: jest.fn() };

  return { config, fakeVisaButton, sdkMarkup, productionAssets, sandboxAssets, fakeV };
}
