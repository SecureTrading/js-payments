import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Service } from 'typedi';
import { ConfigProvider } from '../config/ConfigProvider';

@Service()
export class Notification {
  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;
  private readonly _display: boolean;
  private readonly _displayOnError: boolean;
  private readonly _displayOnSuccess: boolean;

  constructor(private _configProvider: ConfigProvider, private _messageBus: MessageBus) {
    this._display = this._configProvider.getConfig().notifications;
    this._displayOnError = this._display && !this._configProvider.getConfig().submitOnError;
    this._displayOnSuccess = this._display && !this._configProvider.getConfig().submitOnSuccess;
  }

  public error(message: string) {
    this._setNotification(NotificationType.Error, message, this._displayOnError);
  }

  public info(message: string) {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string) {
    this._setNotification(NotificationType.Success, message, this._displayOnSuccess);
  }

  public warning(message: string) {
    this._setNotification(NotificationType.Warning, message);
  }

  private _setNotification(type: string, content: string, display: boolean = true) {
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
