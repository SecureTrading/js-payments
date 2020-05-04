import { NotificationService } from '../classes/notification/NotificationService';
import { MessageBus } from '../../application/core/shared/MessageBus';
import { ConfigProvider } from '../../application/core/services/ConfigProvider';
import { NotificationType } from '../../application/core/models/constants/NotificationType';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';

// given
describe('NotificationService', () => {
  let messageBus: MessageBus;
  let configProvider: ConfigProvider;
  let notificationService: NotificationService;

  beforeEach(() => {
    // given
    messageBus = mock(MessageBus);
    configProvider = mock(ConfigProvider);
    notificationService = new NotificationService(instance(messageBus), instance(configProvider));
  });
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
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Error, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
          }),
          true
        )
      ).once();
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
    it('should call _setNotification with success message and success type of notification', () => {
      notificationService.success('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Success, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
          }),
          true
        )
      ).once();
    });
  });

  // given
  describe('cancel function has been called', () => {
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
    it('should call _setNotification with cancel message and cancel type of notification', () => {
      notificationService.cancel('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Cancel, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
          }),
          true
        )
      ).once();
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
    it('should call _setNotification with info message and info type of notification', () => {
      notificationService.info('Test value');
      verify(
        messageBus.publish(
          deepEqual({
            data: { type: NotificationType.Info, content: 'Test value' },
            type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
          }),
          true
        )
      ).once();
    });
  });
});
