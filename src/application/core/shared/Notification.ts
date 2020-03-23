import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Service } from 'typedi';
import { ConfigProvider } from '../services/ConfigProvider';

@Service()
export class Notification {
  private get disableNotification(): boolean {
    return this._configProvider.getConfig().disableNotification;
  }

  private get submitOnError(): boolean {
    return this._configProvider.getConfig().submitOnError;
  }

  private get submitOnSuccess(): boolean {
    return this._configProvider.getConfig().submitOnSuccess;
  }

  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;

  constructor(private _configProvider: ConfigProvider, private _messageBus: MessageBus) {
  }

  public error(message: string): void {
    const displayOnError = !this.disableNotification && !this.submitOnError;
    this._setNotification(NotificationType.Error, message, displayOnError);
  }

  public info(message: string): void {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string): void {
    const displayOnSuccess = !this.disableNotification && !this.submitOnSuccess;
    this._setNotification(NotificationType.Success, message, displayOnSuccess);
  }

  public warning(message: string): void {
    this._setNotification(NotificationType.Warning, message);
  }

  private _setNotification(type: string, content: string, display: boolean = true): void {
    if (!display) {
      return;
    }
    this._notificationEvent = { content, type };
    this._messageBusEvent = {
      data: this._notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(this._messageBusEvent);
  }
}
