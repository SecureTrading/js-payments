import { INotificationEvent, NotificationType } from '../models/NotificationEvent';
import MessageBus from './MessageBus';

export default class Notification {
  public _messageBus: MessageBus;

  constructor() {
    this._messageBus = new MessageBus();
  }

  public error(message: string) {
    this._setNotification(NotificationType.Error, message);
  }

  public info(message: string) {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string) {
    this._setNotification(NotificationType.Success, message);
  }

  public warning(message: string) {
    this._setNotification(NotificationType.Warning, message);
  }

  private _setNotification(type: string, content: string) {
    const notificationEvent: INotificationEvent = {
      content,
      type
    };
    const messageBusEvent: IMessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(messageBusEvent);
  }
}
