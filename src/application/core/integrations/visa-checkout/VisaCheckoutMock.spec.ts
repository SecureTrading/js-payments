import { VisaCheckoutMock } from './VisaCheckoutMock';
import { anyString, instance as mockInstance, mock, when } from 'ts-mockito';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { EMPTY, of } from 'rxjs';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { MessageBus } from '../shared/MessageBus';
import { NotificationService } from '../../../client/classes/notification/NotificationService';

jest.mock('./../../shared/notification/Notification');

// given
describe('Visa Checkout Mock class', () => {
  let body: object;
  let instance: any;
  const configProvider = mock<ConfigProvider>();
  const communicator = mock(InterFrameCommunicator);
  const messageBus = mock(MessageBus);
  const notification = mock(NotificationService);
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  // when
  beforeEach(() => {
    when(communicator.whenReceive(anyString())).thenReturn({
      thenRespond: () => undefined
    });
    when(configProvider.getConfig$()).thenReturn(of({ jwt, disableNotification: false }));
    instance = new VisaCheckoutMock(
      mockInstance(configProvider),
      mockInstance(communicator),
      mockInstance(messageBus),
      mockInstance(notification)
    );
    body = document.body;
  });

  // given
  // describe('_instantiateVisa()', () => {
  //   // then
  //   it('should not call V.init', () => {
  //     const { fakeV } = VisaCheckoutMockFixture();
  //     // @ts-ignore
  //     global.V = fakeV;
  //     instance._initConfiguration = { myDummy: 'config' };
  //     instance.initPaymentConfiguration();
  //     expect(fakeV.init).toHaveBeenCalledTimes(0);
  //   });
  // });

  // given
  // describe('paymentStatusHandler()', () => {
  //   // then
  //   it('should add dom listener to mock button and if clicked call _handleMockedData', () => {
  //     instance._handleMockedData = jest.fn();
  //     instance.paymentStatusHandler();
  //     const element = document.getElementById('v-button');
  //     const ev = new MouseEvent('click');
  //     element.dispatchEvent(ev);
  //     expect(instance._handleMockedData).toHaveBeenCalledTimes(1);
  //     expect(instance._handleMockedData).toHaveBeenCalledWith();
  //   });
  // });

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
  // describe('_proceedFlowWithMockedData()', () => {
  //   // when
  //   beforeEach(() => {
  //     instance.onSuccess = jest.fn();
  //     instance.onError = jest.fn();
  //     instance.onCancel = jest.fn();
  //   });
  //   // then
  //   it('should call onSuccess if status SUCCESS with payment', () => {
  //     instance._proceedFlowWithMockedData('PAYMENT', 'SUCCESS');
  //     expect(instance.onSuccess).toHaveBeenCalledTimes(1);
  //     expect(instance.onSuccess).toHaveBeenCalledWith('PAYMENT');
  //     expect(instance.onError).toHaveBeenCalledTimes(0);
  //     expect(instance.onCancel).toHaveBeenCalledTimes(0);
  //   });
  //   // then
  //   it('should call _onError if status ERROR', () => {
  //     instance._proceedFlowWithMockedData('PAYMENT', 'ERROR');
  //     expect(instance.onSuccess).toHaveBeenCalledTimes(0);
  //     expect(instance.onError).toHaveBeenCalledTimes(1);
  //     expect(instance.onError).toHaveBeenCalledWith();
  //     expect(instance.onCancel).toHaveBeenCalledTimes(0);
  //   });
  //   // then
  //   it('should call onCancel if status WARNING', () => {
  //     instance._proceedFlowWithMockedData('PAYMENT', 'WARNING');
  //     expect(instance.onSuccess).toHaveBeenCalledTimes(0);
  //     expect(instance.onError).toHaveBeenCalledTimes(0);
  //     expect(instance.onCancel).toHaveBeenCalledTimes(1);
  //     expect(instance.onCancel).toHaveBeenCalledWith();
  //   });
  //   // then
  //   it('should call nothing if unknown status', () => {
  //     instance._proceedFlowWithMockedData('PAYMENT', 'UNKNOWN');
  //     expect(instance.onSuccess).toHaveBeenCalledTimes(0);
  //     expect(instance.onError).toHaveBeenCalledTimes(0);
  //     expect(instance.onCancel).toHaveBeenCalledTimes(0);
  //   });
  // });
});

function VisaCheckoutMockFixture() {
  const html = '<button id="v-button" />';
  document.body.innerHTML = html;
  const livestatus: number = 0;
  const config = {
    name: 'VISA',
    merchantId: '2ig278`13b123872121h31h20e',
    buttonSettings: { size: '154', color: 'neutral' },
    settings: { displayName: 'My Test Site' },
    paymentRequest: { subtotal: '20.00' }
  };
  const fakeV = { init: jest.fn(), on: jest.fn() };

  return { config, fakeV, livestatus };
}
