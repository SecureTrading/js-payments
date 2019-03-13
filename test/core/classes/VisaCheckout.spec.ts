import VisaCheckout from '../../../src/core/classes/VisaCheckout';

// given
describe('Visa Checkout class', () => {
  let instance: any;
  let body: object;
  // when
  beforeEach(() => {
    const { config } = VisaCheckoutFixture();
    instance = new VisaCheckout(config);
    body = document.body;
  });

  // given
  describe('Method _createVisaButton', () => {
    const { fakeVisaButton } = VisaCheckoutFixture();

    // then
    it('should button be defined', () => {
      expect(VisaCheckout._createVisaButton()).toBeDefined();
    });

    // then
    it('should img markup have certain attributes', () => {
      expect(VisaCheckout._createVisaButton()).toMatchObject(fakeVisaButton);
    });
  });

  // given
  describe('Method __attachVisaButton', () => {
    // then
    it('should prepared structure be equal to real document object ', () => {
      expect(instance._attachVisaButton()).toEqual(body);
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
    it('should triggers _paymentStatusHandler three times', () => {
      instance._initVisaConfiguration();
      expect(instance._paymentStatusHandler()).toBeCalledTimes(3);
    });
  });

  // given
  describe('Method _paymentStatusHandler', () => {
    // then
    it('should return proper cancel status when cancel event is triggered', () => {
      expect(instance._paymentStatusHandler('payment.cancel').toEqual());
    });

    // then
    it('should return proper success status when success event is triggered', () => {
      expect(instance._paymentStatusHandler('payment.success').toEqual());
    });

    // then
    it('should return proper error status when error event is triggered', () => {
      expect(instance._paymentStatusHandler('payment.error').toEqual());
    });
  });

  // given
  describe('Method _initPaymentConfiguration', () => {
    // then
    it('should trigger V.init function with proper configuration', () => {});
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

  return { config, fakeVisaButton, sdkMarkup };
}
