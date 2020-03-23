import { NotificationService } from '../../../src/core/services/notification/NotificationService';
import { MessageBus } from '../../../src/core/shared/MessageBus';
import { ConfigProvider } from '../../../src/core/config/ConfigProvider';
import { Container } from 'typedi';
import { NotificationType } from '../../../src/core/models/constants/NotificationType';

// given
describe('NotificationService', () => {
  // given
  describe('error function has been called', () => {

    const instance: NotificationService = Container.get(NotificationService);

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._configProvider.getConfig = jest.fn().mockReturnValueOnce({
        disableNotification: false,
        submitOnError: false,
        submitOnSuccess: false
      });
    });

    // then
    it.skip('should call _setNotification with error message and error type of notification', () => {
      instance.error('Test value');
      // @ts-ignore
      expect(instance._setNotification).toHaveBeenCalledWith(NotificationType.Error, 'Test value');
    });
  });
});
