import MessageBus from '../../core/shared/MessageBus';

enum messageTypes {
  error = 'ERROR',
  info = 'INFO',
  success = 'SUCCESS',
  warning = 'WARNING'
}

interface NotificationEventData {
  message: string;
}

/**
 * NotificationFrame class
 * Defines component for displaying payment status messages
 */
export default class NotificationFrame {
  private _messageBus: MessageBus;

  get notificationFrameElement(): HTMLElement {
    return this._notificationFrameElement;
  }

  set notificationFrameElement(value: HTMLElement) {
    this._notificationFrameElement = value;
  }

  public static ELEMENT_CLASSES = {
    error: 'notification-frame--error',
    info: 'notification-frame--info',
    success: 'notification-frame--success',
    warning: 'notification-frame--warning'
  };

  public static getElement = (elementId: string) => document.getElementById(elementId);

  public static ifFieldExists = (): HTMLInputElement =>
    document.getElementById(NotificationFrame.ELEMENT_ID) as HTMLInputElement;

  /**
   * Returns proper class for every type of incoming message
   * @param messageType
   */
  public static _getMessageClass(messageType: string) {
    if (messageType === messageTypes.error) {
      return NotificationFrame.ELEMENT_CLASSES.error;
    } else if (messageType === messageTypes.success) {
      return NotificationFrame.ELEMENT_CLASSES.success;
    } else if (messageType === messageTypes.warning) {
      return NotificationFrame.ELEMENT_CLASSES.warning;
    } else if (messageType === messageTypes.info) {
      return NotificationFrame.ELEMENT_CLASSES.info;
    } else {
      return '';
    }
  }

  private static ELEMENT_ID: string = 'st-notification-frame';
  public _message: { type: messageTypes; content: string };
  private _notificationFrameElement: HTMLElement;

  constructor() {
    this._messageBus = new MessageBus();

    this.notificationFrameElement = NotificationFrame.getElement(NotificationFrame.ELEMENT_ID);

    this._onInit();
  }

  private _onInit() {
    this._onMessage();
  }

  /**
   * Listens to postMessage event, receives message from it and triggers method for inserting content into div
   */
  private _onMessage() {
    this._messageBus.subscribe(MessageBus.EVENTS.NOTIFICATION_SUCCESS, (data: NotificationEventData) => {
      this._message = { type: messageTypes.success, content: data.message };
      this.insertContent();
      this.setAttributeClass();
    });
  }

  /**
   * Inserts content of incoming text info into div
   */
  public insertContent() {
    if (this.notificationFrameElement) {
      this.notificationFrameElement.textContent = this._message.content;
    }
  }

  /**
   * Sets proper class to message container
   * @private
   */
  public setAttributeClass() {
    if (this.notificationFrameElement) {
      this.notificationFrameElement.classList.add(NotificationFrame._getMessageClass(this._message.type));
    }
  }
}
