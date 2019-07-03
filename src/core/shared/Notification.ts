import { INotificationEvent, NotificationType } from '../models/NotificationEvent';
import MessageBus from './MessageBus';
import Selectors from './Selectors';

/**
 * @class
 * Defines Notification component which gives information for user about payment status.
 */
export default class Notification {
  private _messageBus: MessageBus;

  constructor() {
    this._messageBus = new MessageBus();
  }

  /**
   * setNotification message 'wrapped' in error theme.
   * @param message
   * @param publishFromParent
   */
  public error(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Error, message, publishFromParent);
  }

  /**
   * setNotification message 'wrapped' in info theme.
   * @param message
   * @param publishFromParent
   */
  public info(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Info, message, publishFromParent);
  }

  /**
   * setNotification message 'wrapped' in success theme.
   * @param message
   * @param publishFromParent
   */
  public success(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Success, message, publishFromParent);
  }

  /**
   * setNotification message 'wrapped' in warning theme.
   * @param message
   * @param publishFromParent
   */
  public warning(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Warning, message, publishFromParent);
  }

  /**
   * Publish information to user and send indicated message data and notification type to Notification.
   * @param type
   * @param content
   * @param publishFromParent
   * @private
   */
  private _setNotification(type: string, content: string, publishFromParent?: boolean) {
    const notificationEvent: INotificationEvent = {
      content,
      type
    };
    const messageBusEvent: IMessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    publishFromParent
      ? this._messageBus.publishFromParent(messageBusEvent, Selectors.NOTIFICATION_FRAME_IFRAME)
      : this._messageBus.publish(messageBusEvent);
  }
}
