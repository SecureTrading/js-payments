import { NotificationType } from '../models/constants/NotificationType';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { INotificationEvent } from '../models/INotificationEvent';
import { MessageBus } from './MessageBus';
import { Container, Service } from 'typedi';
import { Frame } from './Frame';
import { Selectors } from './Selectors';
import { environment } from '../../environments/environment';
import { Translator } from './Translator';
import { FramesHub } from '../services/message-bus/FramesHub';

@Service()
export class Notification extends Frame {
  get notificationFrameElement(): HTMLElement {
    return this._notificationFrameElement;
  }

  set notificationFrameElement(value: HTMLElement) {
    this._notificationFrameElement = value;
  }

  public static MESSAGE_TYPES = {
    error: 'ERROR',
    info: 'INFO',
    success: 'SUCCESS',
    warning: 'WARNING'
  };

  public static ELEMENT_CLASSES = {
    error: Selectors.NOTIFICATION_FRAME_ERROR_CLASS,
    info: Selectors.NOTIFICATION_FRAME_INFO_CLASS,
    success: Selectors.NOTIFICATION_FRAME_SUCCESS_CLASS,
    warning: Selectors.NOTIFICATION_FRAME_WARNING_CLASS
  };

  public static getElement = (elementId: string) => document.getElementById(elementId);

  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(Notification.ELEMENT_ID) as HTMLInputElement;

  public static _getMessageClass(messageType: string) {
    if (messageType === NotificationType.Error) {
      return Notification.ELEMENT_CLASSES.error;
    } else if (messageType === NotificationType.Success) {
      return Notification.ELEMENT_CLASSES.success;
    } else if (messageType === NotificationType.Warning) {
      return Notification.ELEMENT_CLASSES.warning;
    } else if (messageType === NotificationType.Info) {
      return Notification.ELEMENT_CLASSES.info;
    } else {
      return '';
    }
  }

  private static readonly NOTIFICATION_TTL = environment.NOTIFICATION_TTL;
  private static ELEMENT_ID: string = Selectors.NOTIFICATION_FRAME_ID;
  public _message: INotificationEvent;
  public _translator: Translator;
  private _notificationFrameElement: HTMLElement;
  private _messageBusEvent: IMessageBusEvent;
  private _notificationEvent: INotificationEvent;

  constructor(private _messageBus: MessageBus) {
    super();
    const notification = document.createElement('div');
    notification.setAttribute('id', Notification.ELEMENT_ID);
    notification.setAttribute('class', 'notification-frame');
    document.getElementsByTagName('body')[0].prepend(notification);
    this.onInit();
  }

  public error(message: string) {
    this._setNotification(NotificationType.Error, message);
  }

  public info(message: string) {
    this._setNotification(NotificationType.Info, message);
  }

  public success(message: string) {
    this._setNotification(NotificationType.Success, message);
  }

  public warning(message: string) {
    this._setNotification(NotificationType.Warning, message);
  }

  private _setNotification(type: string, content: string) {
    this._notificationEvent = { content, type };
    this._messageBusEvent = {
      data: this._notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(this._messageBusEvent);
  }

  protected getAllowedStyles() {
    let allowed = super.getAllowedStyles();
    const notification = `#${Notification.ELEMENT_ID}`;
    const error = `.${Notification.ELEMENT_CLASSES.error}${notification}`;
    const success = `.${Notification.ELEMENT_CLASSES.success}${notification}`;
    const warning = `.${Notification.ELEMENT_CLASSES.warning}${notification}`;
    const info = `.${Notification.ELEMENT_CLASSES.info}${notification}`;
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
      'background-color-notification-warning': {
        property: 'background-color',
        selector: warning
      },
      'border-color-notification': { property: 'border-color', selector: notification },
      'border-color-notification-error': { property: 'border-color', selector: error },
      'border-color-notification-info': { property: 'border-color', selector: info },
      'border-color-notification-success': {
        property: 'border-color',
        selector: success
      },
      'border-color-notification-warning': {
        property: 'border-color',
        selector: warning
      },
      'border-radius-notification': { property: 'border-radius', selector: notification },
      'border-radius-notification-error': { property: 'border-radius', selector: error },
      'border-radius-notification-info': { property: 'border-radius', selector: info },
      'border-radius-notification-success': {
        property: 'border-radius',
        selector: success
      },
      'border-radius-notification-warning': {
        property: 'border-radius',
        selector: warning
      },
      'border-size-notification': { property: 'border-size', selector: notification },
      'border-size-notification-error': { property: 'border-size', selector: error },
      'border-size-notification-info': { property: 'border-size', selector: info },
      'border-size-notification-success': { property: 'border-size', selector: success },
      'border-size-notification-warning': { property: 'border-size', selector: warning },
      'color-notification': { property: 'color', selector: notification },
      'color-notification-error': { property: 'color', selector: error },
      'color-notification-info': { property: 'color', selector: info },
      'color-notification-success': { property: 'color', selector: success },
      'color-notification-warning': { property: 'color', selector: warning },
      'font-size-notification': { property: 'font-size', selector: notification },
      'line-height-notification': { property: 'line-height', selector: notification },
      'space-inset-notification': { property: 'padding', selector: notification },
      'space-inset-notification-error': { property: 'padding', selector: error },
      'space-inset-notification-info': { property: 'padding', selector: info },
      'space-inset-notification-success': { property: 'padding', selector: success },
      'space-inset-notification-warning': { property: 'padding', selector: warning },
      'space-outset-notification': { property: 'margin', selector: notification },
      'space-outset-notification-error': { property: 'margin', selector: error },
      'space-outset-notification-info': { property: 'margin', selector: info },
      'space-outset-notification-success': { property: 'margin', selector: success },
      'space-outset-notification-warning': { property: 'margin', selector: warning }
    };
    return allowed;
  }

  protected async onInit() {
    super.onInit();
    Container.get(FramesHub).waitForFrame(Selectors.CONTROL_FRAME_IFRAME).subscribe(() => {
      this._translator = new Translator(this.params.locale);
      this._onMessage();
    });
  }

  private _onMessage() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.NOTIFICATION, this._callNotificationEvent);
  }

  private _insertContent() {
    if (this.notificationFrameElement) {
      this.notificationFrameElement.textContent = this._translator.translate(this._message.content);
    }
  }

  private _setDataNotificationColorAttribute(messageType: string) {
    if (this.notificationFrameElement) {
      if (messageType === Notification.MESSAGE_TYPES.error) {
        this.notificationFrameElement.setAttribute('data-notification-color', 'red');
      } else if (messageType === Notification.MESSAGE_TYPES.info) {
        this.notificationFrameElement.setAttribute('data-notification-color', 'grey');
      } else if (messageType === Notification.MESSAGE_TYPES.success) {
        this.notificationFrameElement.setAttribute('data-notification-color', 'green');
      } else if (messageType === Notification.MESSAGE_TYPES.warning) {
        this.notificationFrameElement.setAttribute('data-notification-color', 'yellow');
      } else {
        this.notificationFrameElement.setAttribute('data-notification-color', 'undefined');
      }
    }
  }

  private _setAttributeClass() {
    const notificationElementClass = Notification._getMessageClass(this._message.type);
    if (this.notificationFrameElement && notificationElementClass) {
      this.notificationFrameElement.classList.add(notificationElementClass);
      this._setDataNotificationColorAttribute(this._message.type);
      if (this._message.type !== Notification.MESSAGE_TYPES.success) {
        this._autoHide(notificationElementClass);
      }
    }
  }

  private _autoHide(notificationElementClass: string) {
    const timeoutId = window.setTimeout(() => {
      this.notificationFrameElement.classList.remove(notificationElementClass);
      window.clearTimeout(timeoutId);
    }, Notification.NOTIFICATION_TTL);
  }

  private _callNotificationEvent = (data: INotificationEvent) => {
    this._message = data;
    this._insertContent();
    this._setAttributeClass();
  };
}
