import { INotificationEvent } from '../models/INotificationEvent';
import { Container, Service } from 'typedi';
import { Selectors } from './Selectors';
import { environment } from '../../../environments/environment';
import { Translator } from './Translator';
import { MessageBus } from './MessageBus';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Styler } from './Styler';
import { IAllowedStyles } from '../models/IAllowedStyles';
import { ConfigProvider } from '../services/ConfigProvider';

@Service()
export class Notification {
  public static NOTIFICATION_CLASSES = {
    error: Selectors.NOTIFICATION_FRAME_ERROR_CLASS,
    info: Selectors.NOTIFICATION_FRAME_INFO_CLASS,
    success: Selectors.NOTIFICATION_FRAME_SUCCESS_CLASS,
    cancel: Selectors.NOTIFICATION_FRAME_CANCEL_CLASS
  };
  public static MESSAGE_TYPES = {
    error: 'ERROR',
    info: 'INFO',
    success: 'SUCCESS',
    cancel: 'CANCEL'
  };

  private static readonly NOTIFICATION_TTL = environment.NOTIFICATION_TTL;

  public _getMessageClass(messageType: string): string {
    return this._messageMap.get(messageType.toLowerCase());
  }

  private _translator: Translator;
  private _messageMap: Map<string, string>;
  private readonly _notificationFrameElement: HTMLElement;

  constructor(
    private _messageBus: MessageBus,
    private _browserLocalStorage: BrowserLocalStorage,
    private _configProvider: ConfigProvider
  ) {
    this._messageMap = new Map(Object.entries(Notification.NOTIFICATION_CLASSES));
    this._notificationFrameElement = document.getElementById(
      this._configProvider.getConfig().componentIds.notificationFrame
    );
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.NOTIFICATION, (event: INotificationEvent) => {
      this._displayNotification(event);
    });

    Container.get(FramesHub)
      .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
      .subscribe(() => {
        this._translator = new Translator(this._browserLocalStorage.getItem('locale'));
      });
    this.applyStyles();
  }

  private applyStyles(): void {
    // @ts-ignore
    new Styler(this.getAllowedStyles()).inject(this._configProvider.getConfig().styles.notificationFrame);
  }

  protected getAllowedStyles() {
    let allowed: IAllowedStyles = {
      'background-color-body': { property: 'background-color', selector: 'body' },
      'color-body': { property: 'color', selector: 'body' },
      'font-size-body': { property: 'font-size', selector: 'body' },
      'line-height-body': { property: 'line-height', selector: 'body' },
      'space-inset-body': { property: 'padding', selector: 'body' },
      'space-outset-body': { property: 'margin', selector: 'body' }
    };
    const notification = `#${Selectors.NOTIFICATION_FRAME_ID}`;
    const error = `.${Notification.NOTIFICATION_CLASSES.error}${notification}`;
    const success = `.${Notification.NOTIFICATION_CLASSES.success}${notification}`;
    const cancel = `.${Notification.NOTIFICATION_CLASSES.cancel}${notification}`;
    const info = `.${Notification.NOTIFICATION_CLASSES.info}${notification}`;
    allowed = {
      ...allowed,
      'background-color-notification': {
        property: 'background-color',
        selector: notification
      },
      'background-color-notification-error': {
        property: 'background-color',
        selector: error
      },
      'background-color-notification-info': {
        property: 'background-color',
        selector: info
      },
      'background-color-notification-success': {
        property: 'background-color',
        selector: success
      },
      'background-color-notification-cancel': {
        property: 'background-color',
        selector: cancel
      },
      'border-color-notification': { property: 'border-color', selector: notification },
      'border-color-notification-error': { property: 'border-color', selector: error },
      'border-color-notification-info': { property: 'border-color', selector: info },
      'border-color-notification-success': {
        property: 'border-color',
        selector: success
      },
      'border-color-notification-cancel': {
        property: 'border-color',
        selector: cancel
      },
      'border-radius-notification': { property: 'border-radius', selector: notification },
      'border-radius-notification-error': { property: 'border-radius', selector: error },
      'border-radius-notification-info': { property: 'border-radius', selector: info },
      'border-radius-notification-success': {
        property: 'border-radius',
        selector: success
      },
      'border-radius-notification-cancel': {
        property: 'border-radius',
        selector: cancel
      },
      'border-size-notification': { property: 'border-width', selector: notification },
      'border-size-notification-error': { property: 'border-width', selector: error },
      'border-size-notification-info': { property: 'border-width', selector: info },
      'border-size-notification-success': { property: 'border-width', selector: success },
      'border-size-notification-cancel': { property: 'border-width', selector: cancel },
      'color-notification': { property: 'color', selector: notification },
      'color-notification-error': { property: 'color', selector: error },
      'color-notification-info': { property: 'color', selector: info },
      'color-notification-success': { property: 'color', selector: success },
      'color-notification-cancel': { property: 'color', selector: cancel },
      'font-size-notification': { property: 'font-size', selector: notification },
      'line-height-notification': { property: 'line-height', selector: notification },
      'space-inset-notification': { property: 'padding', selector: notification },
      'space-inset-notification-error': { property: 'padding', selector: error },
      'space-inset-notification-info': { property: 'padding', selector: info },
      'space-inset-notification-success': { property: 'padding', selector: success },
      'space-inset-notification-cancel': { property: 'padding', selector: cancel },
      'space-outset-notification': { property: 'margin', selector: notification },
      'space-outset-notification-error': { property: 'margin', selector: error },
      'space-outset-notification-info': { property: 'margin', selector: info },
      'space-outset-notification-success': { property: 'margin', selector: success },
      'space-outset-notification-cancel': { property: 'margin', selector: cancel }
    };
    return allowed;
  }

  private _insertContent(content: string): void {
    this._notificationFrameElement.textContent = this._translator.translate(content);
  }

  private _setDataNotificationColorAttribute(messageType: string): void {
    switch (messageType) {
      case Notification.MESSAGE_TYPES.error:
        this._notificationFrameElement.setAttribute('data-notification-color', 'red');
        break;
      case Notification.MESSAGE_TYPES.info:
        this._notificationFrameElement.setAttribute('data-notification-color', 'grey');
        break;
      case Notification.MESSAGE_TYPES.success:
        this._notificationFrameElement.setAttribute('data-notification-color', 'green');
        break;
      case Notification.MESSAGE_TYPES.cancel:
        this._notificationFrameElement.setAttribute('data-notification-color', 'yellow');
        break;
      default:
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
