import VisaCheckout from '../../../src/core/classes/VisaCheckout';

// given
describe('Visa Checkout class', () => {
  let body: object;
  let instance: any;
  // when
  beforeEach(() => {
    const { config } = VisaCheckoutFixture();
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
    instance = new VisaCheckout(config, jwt);
    body = document.body;
  });

  // given
  describe('Method _setInitConfiguration', () => {
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
  describe('Method _getInitPaymentRequest', () => {
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
  describe('Method setConfiguration', () => {
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
  describe('Method _createVisaButton', () => {
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
  describe('Method _initVisaConfiguration', () => {
    // then
    let sdkMarkup: object;
    beforeEach(() => {
      sdkMarkup = VisaCheckoutFixture().sdkMarkup;
    });
    it('should init script on button', () => {
      expect(instance._initVisaConfiguration()).toEqual(sdkMarkup);
    });
    // then
    it('should triggers _paymentStatusHandler for each status (cancel, error, success)', () => {});
  });

  // given
  describe('Method __attachVisaButton', () => {
    // then
    it('should prepared structure be equal to real document object ', () => {
      expect(instance._attachVisaButton()).toEqual(body);
    });
  });

  // given
  describe('Method _checkLiveStatus', () => {
    // then
    it('should set sandbox assets when application is not live', () => {
      const { sandboxAssets } = VisaCheckoutFixture();
      instance._checkLiveStatus();
      expect(instance._visaCheckoutButtonProps.src).toEqual(sandboxAssets.buttonImg);
      expect(instance._sdkAddress).toEqual(sandboxAssets.sdk);
    });
    it('should set production assets when application is live', () => {
      const { productionAssets } = VisaCheckoutFixture();
      instance._livestatus = 1;
      instance._checkLiveStatus();
      expect(instance._visaCheckoutButtonProps.src).toEqual(productionAssets.buttonImg);
      expect(instance._sdkAddress).toEqual(productionAssets.sdk);
    });
  });

  describe('Method _paymentStatusHandler', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {});
  });

  // given
  describe('Method _initPaymentConfiguration', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {});
  });
});

function VisaCheckoutFixture() {
  const productionAssets = {
    sdk: 'https://secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    buttonImg: 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };
  const sandboxAssets = {
    sdk: 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js',
    buttonImg: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };

  const visaButttonProps = {
    alt: 'Visa Checkout',
    class: 'v-button',
    role: 'button',
    src: 'https://sandbox.secure.checkout.visa.com/wallet-services-web/xo/button.png'
  };
  const config = {
    name: 'VISA',
    livestatus: 0,
    props: {
      apikey: '2ig278`13b123872121h31h20e'
    },
    settings: { displayName: 'My Test Site' },
    paymentRequest: { subtotal: '20.00' },
    buttonSettings: { size: '154' }
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

  return { config, fakeVisaButton, sdkMarkup, productionAssets, sandboxAssets };
}
