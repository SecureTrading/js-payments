import ControlFrame from '../../../src/components/control-frame/ControlFrame';

// given
describe('ControlFrame', () => {
  // given
  describe('onInit', () => {});

  // given
  describe('getAllowedParams', () => {});

  // given
  describe('_initSubscriptions', () => {});

  // given
  describe('_onCardNumberStateChange', () => {});

  // given
  describe('_onExpirationDateStateChange', () => {});

  // given
  describe('_onSecurityCodeStateChange', () => {});

  // given
  describe('_onSetRequestTypesEvent', () => {});

  // given
  describe('_onSubmit', () => {});

  // given
  describe('_onLoad', () => {});

  // given
  describe('_onLoadCardinal', () => {});

  // given
  describe('_onThreeDInitEvent', () => {});

  // given
  describe('_onByPassInitEvent', () => {});

  // given
  describe('_onProcessPaymentEvent', () => {});

  // given
  describe('_processThreeDResponse', () => {});

  // given
  describe('_processPayment', () => {});

  // given
  describe('_requestByPassInit', () => {});

  // given
  describe('_requestPayment', () => {});

  // given
  describe('_requestThreeDInit', () => {});

  // given
  describe('_storeMerchantData', () => {
    const { instance } = controlFrameFixture();

    // then
    it('should set _merchantFormData', () => {});
  });
});

function controlFrameFixture() {
  const instance = new ControlFrame();
  return { instance };
}
