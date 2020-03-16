import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Container } from 'typedi';

export class Notification {
  private _messageBus: MessageBus;
  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;

  constructor() {
    this._messageBus = Container.get(MessageBus);
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
    this._notificationEvent = { content, type };
    this._messageBusEvent = {
      data: this._notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(this._messageBusEvent);
  }
}
