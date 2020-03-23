import { Notification } from './Notification';
import { MessageBus } from './MessageBus';
import { instance, mock, when } from 'ts-mockito';
import { ConfigProvider } from '../../../../src/application/core/services/ConfigProvider';

// given
describe('Notification', () => {
  const { notificationInstance } = notificationFixture();
  // when
  beforeEach(() => {
    // @ts-ignore
    notificationInstance._messageBus.publish = jest.fn();
  });

  // given
  describe('error()', () => {
    // then
    it('should send error notification', () => {
      notificationInstance.error('abc');
      // @ts-ignore
      expect(notificationInstance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'ERROR'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('info()', () => {
    // then
    it('should send info notification', () => {
      notificationInstance.info('abc');
      // @ts-ignore
      expect(notificationInstance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'INFO'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('success()', () => {
    // then
    it('should send info success', () => {
      notificationInstance.success('abc');
      // @ts-ignore
      expect(notificationInstance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'SUCCESS'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('warning()', () => {
    // then
    it('should send info warning', () => {
      notificationInstance.warning('abc');
      // @ts-ignore
      expect(notificationInstance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'WARNING'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });
});

function notificationFixture() {
  let configProvider: ConfigProvider;
  let messageBus: MessageBus;
  configProvider = mock(ConfigProvider);
  messageBus = mock(MessageBus);
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    disableNotification: false,
    submitOnSuccess: false,
    submitOnError: false
  });
  const notificationInstance: Notification = new Notification(instance(configProvider), instance(messageBus));
  return { notificationInstance };
}
