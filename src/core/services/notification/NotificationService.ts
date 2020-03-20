import { MessageBus } from '../../shared/MessageBus';
import { Service } from 'typedi';
import { NotificationType } from '../../models/constants/NotificationType';
import { ConfigProvider } from '../../config/ConfigProvider';

@Service()
export class NotificationService {
  private _display: boolean;
  private _displayOnError: boolean;
  private _displayOnSuccess: boolean;

  constructor(private _messageBus: MessageBus, private _configProvider: ConfigProvider) {
  }

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

  public error(message: string): void {
    this.display = this._configProvider.getConfig().notifications;
    this.displayOnError = this.display && !this._configProvider.getConfig().submitOnError;
    this._setNotification(NotificationType.Error, message, this.displayOnError);
  }

  public info(message: string): void {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string): void {
    console.error(message);
    this.display = this._configProvider.getConfig().notifications;
    this.displayOnSuccess = this.display && !this._configProvider.getConfig().submitOnSuccess;
    this._setNotification(NotificationType.Success, message, this.displayOnSuccess);
  }

  public warning(message: string): void {
    this._setNotification(NotificationType.Warning, message);
  }

  private _setNotification(type: string, content: string, display: boolean = true): void {
    if (!display) {
      return;
    }
    console.error('test');
    console.error(this._messageBus);
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.NOTIFICATION, data: { type, content }});
  }
}
