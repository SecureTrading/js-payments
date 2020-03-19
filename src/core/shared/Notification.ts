import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Service } from 'typedi';
import { ConfigProvider } from '../config/ConfigProvider';

@Service()
export class Notification {

  get display(): boolean {
    return this._display;
  }

  set display(value: boolean) {
    this._display = value;
  }

  get displayOnError(): boolean {
    return this._displayOnError;
  }

  set displayOnError(value: boolean) {
    this._displayOnError = value;
  }

  get displayOnSuccess(): boolean {
    return this._displayOnSuccess;
  }

  set displayOnSuccess(value: boolean) {
    this._displayOnSuccess = value;
  }

  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;
  private _display: boolean;
  private _displayOnError: boolean;
  private _displayOnSuccess: boolean;

  constructor(private _configProvider: ConfigProvider, private _messageBus: MessageBus) {
  }

  public error(message: string) {
    this.display = this._configProvider.getConfig().notifications;
    this.displayOnError = this.display && !this._configProvider.getConfig().submitOnError;
    this._setNotification(NotificationType.Error, message, this.displayOnError);
  }

  public info(message: string) {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string) {
    this.display = this._configProvider.getConfig().notifications;
    this.displayOnSuccess = this.display && !this._configProvider.getConfig().submitOnSuccess;
    console.error(this.displayOnSuccess);
    console.error(this._configProvider.getConfig());
    this._setNotification(NotificationType.Success, message, this.displayOnSuccess);
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
