import DomMethods from '../../core/shared/DomMethods';
import Frame from '../../core/shared/Frame';
import MessageBus from '../../core/shared/MessageBus';
import { NotificationEvent, NotificationType } from '../../core/models/NotificationEvent';
import Selectors from '../../core/shared/Selectors';

/**
 * NotificationFrame class
 * Defines component for displaying payment status messages
 */
export default class NotificationFrame extends Frame {
  public message: NotificationEvent;
  public notificationFrameElement: HTMLElement;

  public static readonly ifFieldExists = () => DomMethods.getElement(Selectors.NOTIFICATION_FRAME_ID);

  /**
   * Returns proper class for every type of incoming message
   * @param messageType
   */
  public static _getMessageClass(messageType: string) {
    if (messageType === NotificationType.Error) {
      return Selectors.NOTIFICATION_FRAME_ERROR_CLASS;
    } else if (messageType === NotificationType.Success) {
      return Selectors.NOTIFICATION_FRAME_SUCCESS_CLASS;
    } else if (messageType === NotificationType.Warning) {
      return Selectors.NOTIFICATION_FRAME_WARNING_CLASS;
    } else if (messageType === NotificationType.Info) {
      return Selectors.NOTIFICATION_FRAME_INFO_CLASS;
    } else {
      return '';
    }
  }

  protected _getAllowedStyles() {
    let allowed = super._getAllowedStyles();
    const notification = `#${Selectors.NOTIFICATION_FRAME_ID}`;
    const error = `.${Selectors.NOTIFICATION_FRAME_ERROR_CLASS}${notification}`;
    const success = `${Selectors.NOTIFICATION_FRAME_SUCCESS_CLASS}${notification}`;
    const warning = `${Selectors.NOTIFICATION_FRAME_WARNING_CLASS}${notification}`;
    const info = `${Selectors.NOTIFICATION_FRAME_INFO_CLASS}${notification}`;
    allowed = {
      ...allowed,
      'background-color-notification': { property: 'background-color', selector: notification },
      'background-color-notification-error': { property: 'background-color', selector: error },
      'background-color-notification-info': { property: 'background-color', selector: info },
      'background-color-notification-success': { property: 'background-color', selector: success },
      'background-color-notification-warning': { property: 'background-color', selector: warning },
      'border-color-notification': { property: 'border-color', selector: notification },
      'border-color-notification-error': { property: 'border-color', selector: error },
      'border-color-notification-info': { property: 'border-color', selector: info },
      'border-color-notification-success': { property: 'border-color', selector: success },
      'border-color-notification-warning': { property: 'border-color', selector: warning },
      'border-radius-notification': { property: 'border-radius', selector: notification },
      'border-radius-notification-error': { property: 'border-radius', selector: error },
      'border-radius-notification-info': { property: 'border-radius', selector: info },
      'border-radius-notification-success': { property: 'border-radius', selector: success },
      'border-radius-notification-warning': { property: 'border-radius', selector: warning },
      'border-size-notification': { property: 'border-size', selector: notification },
      'border-size-notification-error': { property: 'border-size', selector: error },
      'border-size-notification-info': { property: 'border-size', selector: info },
      'border-size-notification-success': { property: 'border-size', selector: success },
      'border-size-notification-warning': { property: 'border-size', selector: warning },
      'color-notification': { property: 'color', selector: notification },
      'color-notification-error': { property: 'color', selector: error },
      'color-notification-info': { property: 'color', selector: info },
      'color-notification-success': { property: 'color', selector: success },
      'color-notification-warning': { property: 'color', selector: warning },
      'font-size-notification': { property: 'font-size', selector: notification },
      'line-height-notification': { property: 'line-height', selector: notification },
      'space-inset-notification': { property: 'padding', selector: notification },
      'space-inset-notification-error': { property: 'padding', selector: error },
      'space-inset-notification-info': { property: 'padding', selector: info },
      'space-inset-notification-success': { property: 'padding', selector: success },
      'space-inset-notification-warning': { property: 'padding', selector: warning },
      'space-outset-notification': { property: 'margin', selector: notification },
      'space-outset-notification-error': { property: 'margin', selector: error },
      'space-outset-notification-info': { property: 'margin', selector: info },
      'space-outset-notification-success': { property: 'margin', selector: success },
      'space-outset-notification-warning': { property: 'margin', selector: warning }
    };
    return allowed;
  }

  private _messageBus: MessageBus;

  constructor() {
    super();
    this._messageBus = new MessageBus();
    this.notificationFrameElement = DomMethods.getElement(Selectors.NOTIFICATION_FRAME_ID);
    this.onInit();
  }

  /**
   * Listens to postMessage event, receives message from it and triggers method for inserting content into div
   */
  public onInit() {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.NOTIFICATION, (data: NotificationEvent) => {
      this.message = { type: data.type, content: data.content };
      this.showNotification();
      this.hideNotification(3000);
    });
  }

  /**
   * Fades notification frame
   * @param timeout
   */
  public hideNotification(timeout: number) {
    setTimeout(() => {
      this.notificationFrameElement.classList.add(Selectors.NOTIFICATION_FRAME_FADE_CLASS);
    }, timeout);
  }

  /**
   * Inserts content of incoming text info into div
   */
  public insertContent() {
    if (this.notificationFrameElement) {
      this.notificationFrameElement.textContent = this.message.content;
    }
  }

  /**
   * Sets proper class to message container
   * @private
   */
  public showNotification() {
    const notificationMessageClass = NotificationFrame._getMessageClass(this.message.type);
    if (this.notificationFrameElement && notificationMessageClass) {
      this.insertContent();
      this.notificationFrameElement.className = `${Selectors.NOTIFICATION_FRAME} ${notificationMessageClass}`;
    }
  }
}
