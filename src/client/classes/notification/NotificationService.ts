import { MessageBus } from '../../../application/core/shared/MessageBus';
import { Service } from 'typedi';
import { NotificationType } from '../../../application/core/models/constants/NotificationType';
import { ConfigProvider } from '../../../application/core/services/ConfigProvider';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';

@Service()
export class NotificationService {
  constructor(private _messageBus: MessageBus, private _configProvider: ConfigProvider) {}

  private get disableNotification(): boolean {
    return this._configProvider.getConfig().disableNotification;
  }

  private get submitOnError(): boolean {
    return this._configProvider.getConfig().submitOnError;
  }

  private get submitOnSuccess(): boolean {
    return this._configProvider.getConfig().submitOnSuccess;
  }

  private get submitOnCancel(): boolean {
    return this._configProvider.getConfig().submitOnCancel;
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

  public cancel(message: string): void {
    if (!this.disableNotification && !this.submitOnCancel) {
      this._setNotification(NotificationType.Cancel, message);
    }
  }

  private _setNotification(type: string, content: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: { content, type },
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(messageBusEvent, true);
  }
}
