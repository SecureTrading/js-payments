import VisaCheckout from '../../../src/core/classes/VisaCheckout.class';

const V = (window as any).V;

// given
describe('Visa Checkout class', () => {
  let instance;
  // when
  beforeEach(() => {
    (global as any).V = jest.fn();
    (global as any).V.init = jest.fn();
    // V.mockClear();
    // instance = new VisaCheckout();
  });

  // given
  describe('Method _createVisaButton', () => {
    // then
    it('should return img markup', () => {});

    // then
    it('should img markup have certain attributes', () => {});
  });

  // given
  describe('Method __attachVisaButton', () => {
    // then
    it('should attach Visa Checkout button into body', () => {});
  });

  // given
  describe('Method _onVisaCheckoutReady', () => {
    // then
    it('should init script on button', () => {});
  });

  // given
  describe('Method __attachVisaButton', () => {
    // then
    it('should attach Visa Checkout button into body', () => {});
  });

  // given
  describe('Method __attachVisaButton', () => {
    // then
    it('should attach Visa Checkout button into body', () => {});
  });
});
