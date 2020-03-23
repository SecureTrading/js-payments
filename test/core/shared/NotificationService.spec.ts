import { NotificationService } from '../../../src/core/services/notification/NotificationService';
import { MessageBus } from '../../../src/core/shared/MessageBus';
import { ConfigProvider } from '../../../src/core/config/ConfigProvider';
import { NotificationType } from '../../../src/core/models/constants/NotificationType';
import { instance, mock, verify, when } from 'ts-mockito';

// given
describe('NotificationService', () => {

  // given
  const messageBus: MessageBus = mock(MessageBus);
  const configProvider: ConfigProvider = mock(ConfigProvider);
  const notificationService: NotificationService = new NotificationService(
    instance(messageBus), instance(configProvider)
  );
  // given
  describe('error function has been called', () => {

    // when
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false
      });
    });

    // then
    it('should call _setNotification with error message and error type of notification', () => {
      notificationService.error('Test value');
      verify(messageBus.publish({
        data: { type: NotificationType.Error, content: 'Test value' },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      }, true)).once();
    });
  });

  // given
  describe('success function has been called', () => {

    // when
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false
      });
    });

    // then
    it('should call _setNotification with success message and error type of notification', () => {
      notificationService.error('Test value');
      verify(messageBus.publish({
        data: { type: NotificationType.Success, content: 'Test value' },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      }, true)).once();
    });
  });

  // given
  describe('info function has been called', () => {

    // when
    beforeEach(() => {
      // @ts-ignore
      when(configProvider.getConfig()).thenReturn({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false
      });
    });

    // then
    it('should call _setNotification with info message and error type of notification', () => {
      notificationService.error('Test value');
      verify(messageBus.publish({
        data: { type: NotificationType.Info, content: 'Test value' },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      }, true)).once();
    });
  });
});
