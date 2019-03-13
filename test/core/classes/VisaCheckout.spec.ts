import VisaCheckout from '../../../src/core/classes/VisaCheckout';

// given
describe('Visa Checkout class', () => {
  let instance;
  // when
  beforeEach(() => {
    const { config } = VisaCheckoutFixture();
    instance = new VisaCheckout(config);
  });

  // given
  describe('Method _createVisaButton', () => {
    const { fakeVisaButton } = VisaCheckoutFixture();

    // then
    it('should be defined', () => {
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
    it('should attach Visa Checkout button into body', () => {});
  });

  // given
  describe('Method _attachVisaSDK', () => {
    // then
    it('should init script on button', () => {});
  });

  // given
  describe('Method _paymentStatusHandler', () => {
    // then
    it('should attach Visa Checkout button into body', () => {});
  });

  // given
  describe('Method _setConfiguration', () => {
    // then
    it('should attach Visa Checkout button into body', () => {});
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

  return { config, fakeVisaButton };
}
