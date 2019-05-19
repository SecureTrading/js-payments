import ApplePaySessionMock from '../../../src/core/integrations/ApplePaySessionMock';

// given
describe('Class ApplePaySessionMock', () => {
  // given
  describe('ApplePayMock.completePayment', () => {
    // when
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
    });

    // then
    it('should always return true', () => {
      expect(session.completePayment()).toBe(true);
    });
  });

  // given
  describe('ApplePayMock.completeMerchantValidation', () => {
    // when
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
    });

    // then
    it('should always return true', () => {
      expect(session.completeMerchantValidation()).toBe(true);
    });
  });

  // given
  describe('ApplePayMock.completePaymentMethodSelection', () => {
    // when
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
    });

    // then
    it('should always return true', () => {
      expect(session.completePaymentMethodSelection()).toBe(true);
    });
  });

  // given
  describe('ApplePayMock._handleResponse', () => {
    // when
    let session: any;
    beforeEach(() => {
      session = applePaySessionMockFixture().session;
      session.onpaymentauthorized = jest.fn();
      session.oncancel = jest.fn();
    });

    // then
    it('should call onsuccess', () => {
      session._handleResponse({
        status: 'SUCCESS'
      });
      expect(session.onpaymentauthorized).toHaveBeenCalledTimes(1);
      expect(session.oncancel).toHaveBeenCalledTimes(0);
      expect(session.onpaymentauthorized).toHaveBeenCalledWith({
        status: 'SUCCESS'
      });
    });

    // then
    it('should call oncancel', () => {
      session._handleResponse({
        status: 'ERROR'
      });
      expect(session.onpaymentauthorized).toHaveBeenCalledTimes(0);
      expect(session.oncancel).toHaveBeenCalledTimes(1);
      expect(session.oncancel).toHaveBeenCalledWith({
        status: 'ERROR'
      });
    });
  });
});

function applePaySessionMockFixture() {
  const session = ApplePaySessionMock;
  return { session };
}
