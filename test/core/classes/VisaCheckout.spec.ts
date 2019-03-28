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
    it('should init script on button', () => {});
    // then
    it('should triggers _paymentStatusHandler for each status (cancel, error, success)', () => {});
  });

  // given
  describe('Method _attachVisaButton', () => {
    // then
    it('should prepared structure be equal to real document object ', () => {
      expect(instance._attachVisaButton()).toEqual(body);
    });
  });

  // given
  describe('Method _setLiveStatus', () => {
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

  describe('Method _paymentStatusHandler', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {});
  });

  // given
  describe('Method _initPaymentConfiguration', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {});
  });

  // given
  describe('Method setNotification', () => {
    // then
    it('', () => {});
  });

  // given
  describe('Method _setActionOnMockedButton', () => {
    // then
    it('', () => {});
  });
  // given
  describe('Method _setMockedData', () => {
    // then
    it('', () => {});
  });
  // given
  describe('Method _proceedFlowWithMockedData', () => {
    // then
    it('', () => {});
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
    }
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
