import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Selectors } from './Selectors';
import { Container } from 'typedi';

export class Notification {
  private _messageBus: MessageBus;
  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;

  constructor() {
    this._messageBus = Container.get(MessageBus);
  }

  public error(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Error, message, publishFromParent);
  }

  public info(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Info, message, publishFromParent);
  }

  public success(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Success, message, publishFromParent);
  }

  public warning(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Warning, message, publishFromParent);
  }

  private _setNotification(type: string, content: string, publishFromParent?: boolean) {
    this._notificationEvent = { content, type };
    this._messageBusEvent = {
      data: this._notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    publishFromParent
      ? this._messageBus.publishFromParent(this._messageBusEvent, Selectors.NOTIFICATION_FRAME_IFRAME)
      : this._messageBus.publish(this._messageBusEvent);
  }
}
