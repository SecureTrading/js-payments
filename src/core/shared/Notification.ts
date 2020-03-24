import { INotificationEvent } from '../models/INotificationEvent';
import { Container, Service } from 'typedi';
import { Selectors } from './Selectors';
import { environment } from '../../environments/environment';
import { Translator } from './Translator';
import { MessageBus } from './MessageBus';
import { FramesHub } from '../services/message-bus/FramesHub';
import { BrowserLocalStorage } from '../services/storage/BrowserLocalStorage';

@Service()
export class Notification {

  private set messageMap(value: Map<string, string>) {
    this._messageMap = value;
  }

  private get messageMap(): Map<string, string> {
    return this._messageMap;
  }

  public static NOTIFICATION_CLASSES = {
    error: Selectors.NOTIFICATION_FRAME_ERROR_CLASS,
    info: Selectors.NOTIFICATION_FRAME_INFO_CLASS,
    success: Selectors.NOTIFICATION_FRAME_SUCCESS_CLASS,
    warning: Selectors.NOTIFICATION_FRAME_WARNING_CLASS
  };
  public static MESSAGE_TYPES = {
    error: 'ERROR',
    info: 'INFO',
    success: 'SUCCESS',
    warning: 'WARNING'
  };

  private static readonly NOTIFICATION_TTL = environment.NOTIFICATION_TTL;

  public static getNotificationContainer = (): HTMLElement =>
    document.getElementById(Selectors.NOTIFICATION_FRAME_ID) as HTMLElement;

  public _getMessageClass(messageType: string): string {
    return this.messageMap.get(messageType.toLowerCase());
  }

  private _translator: Translator;
  private _messageMap: Map<string, string>;
  private readonly _notificationFrameElement: HTMLElement;

  constructor(private _messageBus: MessageBus, private _browserLocalStorage: BrowserLocalStorage) {
    this.messageMap = new Map(Object.entries(Notification.NOTIFICATION_CLASSES));
    this._notificationFrameElement = Notification.getNotificationContainer();

    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.NOTIFICATION, (event: INotificationEvent) => {
      this._displayNotification(event);
    });

    Container.get(FramesHub).waitForFrame(Selectors.CONTROL_FRAME_IFRAME).subscribe(() => {
      this._translator = new Translator(this._browserLocalStorage.getItem('locale'));
    });
  }

  private _insertContent(content: string): void {
    this._notificationFrameElement.textContent = this._translator.translate(content);
  }

  private _setDataNotificationColorAttribute(messageType: string): void {
    if (messageType === Notification.MESSAGE_TYPES.error) {
      this._notificationFrameElement.setAttribute('data-notification-color', 'red');
    } else if (messageType === Notification.MESSAGE_TYPES.info) {
      this._notificationFrameElement.setAttribute('data-notification-color', 'grey');
    } else if (messageType === Notification.MESSAGE_TYPES.success) {
      this._notificationFrameElement.setAttribute('data-notification-color', 'green');
    } else if (messageType === Notification.MESSAGE_TYPES.warning) {
      this._notificationFrameElement.setAttribute('data-notification-color', 'yellow');
    } else {
      this._notificationFrameElement.setAttribute('data-notification-color', 'undefined');
    }
  }

  private _setAttributeClass(type: string): void {
    const notificationElementClass = this._getMessageClass(type);
    this._notificationFrameElement.classList.add(Selectors.NOTIFICATION_FRAME_CORE_CLASS);
    if (notificationElementClass) {
      this._notificationFrameElement.classList.add(notificationElementClass);
      this._setDataNotificationColorAttribute(type);
      if (type !== Notification.MESSAGE_TYPES.success) {
        this._autoHide(notificationElementClass);
      }
    }
  }

  private _autoHide(notificationElementClass: string): void {
    const timeoutId = window.setTimeout(() => {
      this._notificationFrameElement.classList.remove(notificationElementClass);
      this._notificationFrameElement.classList.remove(Selectors.NOTIFICATION_FRAME_CORE_CLASS);
      this._insertContent('');
      window.clearTimeout(timeoutId);
    }, Notification.NOTIFICATION_TTL);
  }

  private _displayNotification(data: INotificationEvent): void {
    const { content, type } = data;
    if (!this._notificationFrameElement) {
      return;
    }
    this._insertContent(content);
    this._setAttributeClass(type);
  }
}
