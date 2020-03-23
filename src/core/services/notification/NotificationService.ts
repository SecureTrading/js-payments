import { MessageBus } from '../../shared/MessageBus';
import { Service } from 'typedi';
import { NotificationType } from '../../models/constants/NotificationType';
import { ConfigProvider } from '../../config/ConfigProvider';
import { INotificationEvent } from '../../models/INotificationEvent';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';

@Service()
export class NotificationService {

  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;

  constructor(private _messageBus: MessageBus, private _configProvider: ConfigProvider) {
  }

  private get disableNotification(): boolean {
    return this._configProvider.getConfig().disableNotification;
  }

  private get submitOnError(): boolean {
    return this._configProvider.getConfig().submitOnError;
  }

  private get submitOnSuccess(): boolean {
    return this._configProvider.getConfig().submitOnSuccess;
  }

  public error(message: string): void {
    if (!this.disableNotification && !this.submitOnError) {
      this._setNotification(NotificationType.Error, message);
    }
  }

  public info(message: string): void {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string): void {
    if (!this.disableNotification && !this.submitOnSuccess) {
      this._setNotification(NotificationType.Success, message);
    }
  }

  public warning(message: string): void {
    this._setNotification(NotificationType.Warning, message);
  }

  private _setNotification(type: string, content: string): void {
    this._notificationEvent = { content, type };
    this._messageBusEvent = {
      data: this._notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(this._messageBusEvent, true);
  }
}
