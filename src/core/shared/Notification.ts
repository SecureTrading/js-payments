import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Selectors } from './Selectors';
import { Service } from 'typedi';
import { ConfigService } from '../config/ConfigService';

@Service()
export class Notification {
  private _messageBus: MessageBus;
  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;
  private readonly _display: boolean;
  private readonly _displayOnError: boolean;
  private readonly _displayOnSuccess: boolean;

  constructor(private configService: ConfigService) {
    this._display = this.configService.getConfig().notifications;
    this._displayOnError = this._display && !this.configService.getConfig().submitOnError;
    this._displayOnSuccess = this._display && !this.configService.getConfig().submitOnSuccess;
    this._messageBus = new MessageBus();
  }

  public error(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Error, message, this._displayOnError, publishFromParent);
  }

  public info(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Info, message, publishFromParent);
  }

  public success(message: string, publishFromParent?: boolean) {
    console.error(this._displayOnSuccess);
    this._setNotification(NotificationType.Success, message, this._displayOnSuccess, publishFromParent);
  }

  public warning(message: string, publishFromParent?: boolean) {
    this._setNotification(NotificationType.Warning, message, publishFromParent);
  }

  private _setNotification(type: string, content: string, display: boolean = true, publishFromParent?: boolean) {
    console.error(display);
    if (!display) {
      return;
    }
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
