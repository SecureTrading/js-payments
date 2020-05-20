import { MessageBus } from './MessageBus';
import { instance, mock, when } from 'ts-mockito';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { ConfigProvider } from '../services/ConfigProvider';
import { Notification } from './Notification';
import { NotificationType } from '../models/constants/NotificationType';
import { MessageBusMock } from '../../../testing/mocks/MessageBusMock';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { Selectors } from './Selectors';
import { of } from 'rxjs';

describe('Notification', () => {
  let messageBus: MessageBus;
  let browserLocalStorage: BrowserLocalStorage;
  let configProvider: ConfigProvider;
  let framesHub: FramesHub;
  let notification: Notification;

  // when
  beforeEach(() => {
    messageBus = (new MessageBusMock() as unknown) as MessageBus;
    browserLocalStorage = mock(BrowserLocalStorage);
    configProvider = mock(ConfigProvider);
    framesHub = mock(FramesHub);

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
    when(browserLocalStorage.getItem('locale')).thenReturn('en');
    when(framesHub.waitForFrame(Selectors.CONTROL_FRAME_IFRAME)).thenReturn(of(Selectors.CONTROL_FRAME_IFRAME));

    notification = new Notification(
      messageBus,
      instance(browserLocalStorage),
      instance(configProvider),
      instance(framesHub)
    );
  });

  // then
  it(`should display notification if ${MessageBus.EVENTS_PUBLIC.NOTIFICATION} has been called`, () => {
    // @ts-ignore
    messageBus.publish(
      {
        data: { content: 'Test', type: NotificationType.Error },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      },
      true
    );

    expect(document.getElementById('st-notification-frame').textContent).toEqual('Test');
  });
});
