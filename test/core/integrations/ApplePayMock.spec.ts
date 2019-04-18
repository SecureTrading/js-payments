import ApplePayMock from './../../../src/core/integrations/ApplePayMock.class';

// given
describe('Class ApplePayMock', () => {
  // given
  describe('_onMockInit', () => {
    // when
    let instance: any;
    let attachMockButtonSpy: any;
    let setActionOnMockedButtonSpy: any;
    beforeEach(() => {
      instance = applePayMockFixture().instance;
      attachMockButtonSpy = jest.spyOn(instance, '_attachMockButton');
    });

    //then
    it('should _attachMockButton been called', () => {
      instance._onMockInit();
      expect(attachMockButtonSpy).toHaveBeenCalled();
    });
  });

  // given
  describe('_attachMockButton', () => {
    // when
    beforeEach(() => {});

    //then
    it('should ...', () => {});
  });

  // given
  describe('_createMockedButton', () => {
    // when
    beforeEach(() => {});

    //then
    it('should ...', () => {});
  });

  // given
  describe('_setActionOnMockedButton', () => {
    // when
    beforeEach(() => {});

    //then
    it('should ...', () => {});
  });

  // given
  describe('_getWalletverifyData', () => {
    // when
    beforeEach(() => {});

    //then
    it('should ...', () => {});
  });

  describe('_proceedFlowWithMockedData', () => {
    // when
    beforeEach(() => {});

    //then
    it('should ...', () => {});
  });
});

function applePayMockFixture() {
  const config = {
    name: 'APPLEPAY',
    props: {
      sitereference: 'test_site',
      paymentRequest: {
        total: { label: 'Secure Trading Merchant', amount: '10.00' },
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: ['amex', 'visa']
      },
      merchantId: 'merchant.net.securetrading',
      sitesecurity: 'gABC123DEFABC',
      placement: 'st-apple-pay',
      buttonText: 'donate',
      buttonStyle: 'white-outline'
    }
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const instance = new ApplePayMock(config, jwt);
  return { instance, config, jwt };
}
