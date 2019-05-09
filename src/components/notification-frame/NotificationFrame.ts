import { INotificationEvent, NotificationType } from '../../core/models/NotificationEvent';
import Frame from '../../core/shared/Frame';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { Translator } from '../../core/shared/Translator';

/**
 * NotificationFrame class
 * Defines component for displaying payment status messages
 */
export default class NotificationFrame extends Frame {
  get notificationFrameElement(): HTMLElement {
    return this._notificationFrameElement;
  }

  set notificationFrameElement(value: HTMLElement) {
    this._notificationFrameElement = value;
  }

  public static ELEMENT_CLASSES = {
    error: Selectors.NOTIFICATION_FRAME_ERROR_CLASS,
    info: Selectors.NOTIFICATION_FRAME_INFO_CLASS,
    success: Selectors.NOTIFICATION_FRAME_SUCCESS_CLASS,
    warning: Selectors.NOTIFICATION_FRAME_WARNING_CLASS
  };

  public static getElement = (elementId: string) => document.getElementById(elementId);

  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(NotificationFrame.ELEMENT_ID) as HTMLInputElement;

  /**
   * Returns proper class for every type of incoming message
   * @param messageType
   */
  public static _getMessageClass(messageType: string) {
    if (messageType === NotificationType.Error) {
      return NotificationFrame.ELEMENT_CLASSES.error;
    } else if (messageType === NotificationType.Success) {
      return NotificationFrame.ELEMENT_CLASSES.success;
    } else if (messageType === NotificationType.Warning) {
      return NotificationFrame.ELEMENT_CLASSES.warning;
    } else if (messageType === NotificationType.Info) {
      return NotificationFrame.ELEMENT_CLASSES.info;
    } else {
      return '';
    }
  }

  private static readonly NOTIFICATION_TTL = 7 * 1000;
  private static ELEMENT_ID: string = Selectors.NOTIFICATION_FRAME_ID;
  public _message: INotificationEvent;
  public _translator: Translator;
  private _messageBus: MessageBus;
  private _notificationFrameElement: HTMLElement;

  constructor() {
    super();
    this._messageBus = new MessageBus();
    this.notificationFrameElement = NotificationFrame.getElement(NotificationFrame.ELEMENT_ID);

    this.onInit();
  }

  public onInit() {
    super.onInit();
    this._translator = new Translator(this._params.locale);
    this._onMessage();
  }

  /**
   * Listens to postMessage event, receives message from it and triggers method for inserting content into div
   */
  public _onMessage() {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.NOTIFICATION, this._notificationEvent);
  }
  /**
   * Inserts content of incoming text info into div
   */
  public insertContent() {
    if (this.notificationFrameElement) {
      this.notificationFrameElement.textContent = this._translator.translate(this._message.content);
    }
  }

  /**
   * Sets proper class to message container
   * @private
   */
  public setAttributeClass() {
    const notificationElementClass = NotificationFrame._getMessageClass(this._message.type);
    if (this.notificationFrameElement && notificationElementClass) {
      this.notificationFrameElement.classList.add(notificationElementClass);
      this._autoHide(notificationElementClass);
    }
  }

  protected _getAllowedStyles() {
    let allowed = super._getAllowedStyles();
    const notification = `#${NotificationFrame.ELEMENT_ID}`;
    const error = `.${NotificationFrame.ELEMENT_CLASSES.error}${notification}`;
    const success = `${NotificationFrame.ELEMENT_CLASSES.success}${notification}`;
    const warning = `${NotificationFrame.ELEMENT_CLASSES.warning}${notification}`;
    const info = `${NotificationFrame.ELEMENT_CLASSES.info}${notification}`;
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

  private _autoHide(notificationElementClass: string) {
    const timeoutId = window.setTimeout(() => {
      this.notificationFrameElement.classList.remove(notificationElementClass);
      window.clearTimeout(timeoutId);
    }, NotificationFrame.NOTIFICATION_TTL);
  }

  private _notificationEvent = (data: INotificationEvent) => {
    this._message = { type: data.type, content: data.content };
    this.insertContent();
    this.setAttributeClass();
  };
}
