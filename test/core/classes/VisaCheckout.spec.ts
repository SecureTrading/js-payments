import VisaCheckout from '../../../src/core/classes/VisaCheckout.class';

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
    beforeEach(() => {});
    // then
    it('should return img markup', () => {
      expect(VisaCheckout._createVisaButton()).toBe(true);
    });

    // then
    it('should img markup have certain attributes', () => {});
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
  const config = {
    name: 'VISA',
    props: {
      apikey: '2ig278`13b123872121h31h20e'
    }
  };
  const fakeVisaButton = {};
  return { config, fakeVisaButton };
}
