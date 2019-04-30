import { NotificationEvent, NotificationType } from '../models/NotificationEvent';
import MessageBus from './MessageBus';

export default class Notification {
  private _messageBus: MessageBus;

  constructor() {
    this._messageBus = new MessageBus();
  }

  private _setNotification(type: string, content: string) {
    const notificationEvent: NotificationEvent = {
      content: content,
      type: type
    };
    const messageBusEvent: MessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(messageBusEvent);
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
}
