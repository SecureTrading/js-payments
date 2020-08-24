import { MessageBus } from '../message-bus/MessageBus';
import { instance, mock, when } from 'ts-mockito';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { Notification } from './Notification';
import { NotificationType } from '../../models/constants/NotificationType';
import { MessageBusMock } from '../../../../testing/mocks/MessageBusMock';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { of } from 'rxjs';
import { Frame } from '../frame/Frame';

describe('Notification', () => {
  let messageBus: MessageBus;
  let browserLocalStorage: BrowserLocalStorage;
  let configProvider: ConfigProvider;
  let framesHub: FramesHub;
  let notification: Notification;
  let frame: Frame;

  // when
  beforeEach(() => {
    messageBus = (new MessageBusMock() as unknown) as MessageBus;
    browserLocalStorage = mock(BrowserLocalStorage);
    configProvider = mock<ConfigProvider>();
    framesHub = mock(FramesHub);
    frame = mock(Frame);

    document.body.innerHTML = `<div id="st-notification-frame"></div>`;

    const config = {
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
    };

    when(configProvider.getConfig()).thenReturn(config);
    when(configProvider.getConfig$()).thenReturn(of(config));
    when(browserLocalStorage.getItem('locale')).thenReturn('en');
    when(framesHub.waitForFrame(CONTROL_FRAME_IFRAME)).thenReturn(of(CONTROL_FRAME_IFRAME));

    notification = new Notification(
      messageBus,
      instance(browserLocalStorage),
      instance(configProvider),
      instance(framesHub),
      instance(frame)
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
