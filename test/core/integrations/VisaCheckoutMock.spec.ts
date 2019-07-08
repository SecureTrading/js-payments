import VisaCheckoutMock from '../../../src/core/integrations/VisaCheckoutMock';
import DomMethods from '../../../src/core/shared/DomMethods';

// given
describe('Visa Checkout Mock class', () => {
  let body: object;
  let instance: any;

  // when
  beforeEach(() => {
    const { config } = VisaCheckoutMockFixture();
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
    instance = new VisaCheckoutMock(config, jwt, 'https://example.com');
    body = document.body;
  });

  // given
  describe('_initPaymentConfiguration()', () => {
    // then
    it('should not call V.init', () => {
      const { fakeV } = VisaCheckoutMockFixture();
      // @ts-ignore
      global.V = fakeV;
      instance._initConfiguration = { myDummy: 'config' };
      instance._initPaymentConfiguration();
      expect(fakeV.init).toHaveBeenCalledTimes(0);
    });
  });

  // given
  describe('_paymentStatusHandler()', () => {
    // then
    it('should add dom listener to mock button and if clicked call _handleMockedData', () => {
      instance._handleMockedData = jest.fn();
      instance._paymentStatusHandler();
      const element = document.getElementById('v-button');
      const ev = new MouseEvent('click');
      element.dispatchEvent(ev);
      expect(instance._handleMockedData).toHaveBeenCalledTimes(1);
      expect(instance._handleMockedData).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_handleMockedData()', () => {
    // then
    it('should call _proceedFlowWithMockedData on successful fetch', async () => {
      instance._proceedFlowWithMockedData = jest.fn();
      const mockResponse = { json: jest.fn().mockReturnValue({ payment: 'somedata', status: 'SUCCESS' }) };
      // @ts-ignore
      global.fetch = jest.fn().mockResolvedValue(mockResponse);
      await instance._handleMockedData();
      expect(instance._proceedFlowWithMockedData).toHaveBeenCalledTimes(1);
      expect(instance._proceedFlowWithMockedData).toHaveBeenCalledWith('somedata', 'SUCCESS');
    });
  });

  // given
  describe('_proceedFlowWithMockedData()', () => {
    // when
    beforeEach(() => {
      instance._onSuccess = jest.fn();
      instance._onError = jest.fn();
      instance._onCancel = jest.fn();
    });
    // then
    it('should call _onSuccess if status SUCCESS with payment', () => {
      instance._proceedFlowWithMockedData('PAYMENT', 'SUCCESS');
      expect(instance._onSuccess).toHaveBeenCalledTimes(1);
      expect(instance._onSuccess).toHaveBeenCalledWith('PAYMENT');
      expect(instance._onError).toHaveBeenCalledTimes(0);
      expect(instance._onCancel).toHaveBeenCalledTimes(0);
    });
    // then
    it('should call _onError if status ERROR', () => {
      instance._proceedFlowWithMockedData('PAYMENT', 'ERROR');
      expect(instance._onSuccess).toHaveBeenCalledTimes(0);
      expect(instance._onError).toHaveBeenCalledTimes(1);
      expect(instance._onError).toHaveBeenCalledWith();
      expect(instance._onCancel).toHaveBeenCalledTimes(0);
    });
    // then
    it('should call _onCancel if status WARNING', () => {
      instance._proceedFlowWithMockedData('PAYMENT', 'WARNING');
      expect(instance._onSuccess).toHaveBeenCalledTimes(0);
      expect(instance._onError).toHaveBeenCalledTimes(0);
      expect(instance._onCancel).toHaveBeenCalledTimes(1);
      expect(instance._onCancel).toHaveBeenCalledWith();
    });
    // then
    it('should call nothing if unknown status', () => {
      instance._proceedFlowWithMockedData('PAYMENT', 'UNKNOWN');
      expect(instance._onSuccess).toHaveBeenCalledTimes(0);
      expect(instance._onError).toHaveBeenCalledTimes(0);
      expect(instance._onCancel).toHaveBeenCalledTimes(0);
    });
  });
});

function VisaCheckoutMockFixture() {
  const html = '<button id="v-button" />';
  document.body.innerHTML = html;
  const config = {
    name: 'VISA',
    livestatus: 0,
    merchantId: '2ig278`13b123872121h31h20e',
    buttonSettings: { size: '154', color: 'neutral' },
    settings: { displayName: 'My Test Site' },
    paymentRequest: { subtotal: '20.00' }
  };
  const fakeV = { init: jest.fn(), on: jest.fn() };

  return { config, fakeV };
}
