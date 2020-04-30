import { MessageBus } from './MessageBus';
import { instance, mock, when } from 'ts-mockito';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { ConfigProvider } from '../services/ConfigProvider';
import { Notification } from './Notification';
import { NotificationType } from '../models/constants/NotificationType';

describe('Notification', () => {
  const messageBus: MessageBus = mock(MessageBus);
  const browserLocalStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  const configProvider: ConfigProvider = mock(ConfigProvider);
  let notification: Notification;

  // when
  beforeEach(() => {
    document.body.innerHTML = `<div id="st-notification-frame"></div>`;
    when(configProvider.getConfig()).thenReturn({
      jwt: '',
      disableNotification: false,
      componentIds: {
        cardNumber: '',
        expirationDate: '',
        securityCode: '',
        notificationFrame: 'st-notification-frame'
      },
      styles: {
        notificationFrame: {
          'color-error': '#FFF333'
        }
      }
    });
    notification = new Notification(instance(messageBus), instance(browserLocalStorage), instance(configProvider));
  });

  // then
  it(`should display notification if ${MessageBus.EVENTS_PUBLIC.NOTIFICATION} has been called`, () => {
    // @ts-ignore
    notification._messageBus.publish(
      {
        data: { content: 'Test', type: NotificationType.Error },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      },
      true
    );
    // @ts-ignore
    expect(notification._notificationFrameElement.textContent).toEqual('');
  });
});
