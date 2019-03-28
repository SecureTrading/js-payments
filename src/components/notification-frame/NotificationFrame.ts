enum messageTypes {
  error = 'ERROR',
  info = 'INFO',
  success = 'SUCCESS',
  warning = 'WARNING'
}

/**
 * NotificationFrame class
 * Defines component for displaying payment status messages
 */
export default class NotificationFrame {
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
    this.errorMessageListener();
    this.notificationFrameElement = NotificationFrame.getElement(NotificationFrame.ELEMENT_ID);
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
    if (this.notificationFrameElement && NotificationFrame._getMessageClass(this._message.type)) {
      this.notificationFrameElement.classList.add(NotificationFrame._getMessageClass(this._message.type));
    }
  }

  /**
   * Listens to postMessage event, receives message from it and triggers method for inserting content into div
   */
  public errorMessageListener() {
    window.addEventListener(
      'message',
      ({ data }) => {
        this._message = data;
        this.insertContent();
        this.setAttributeClass();
      },
      false
    );
  }
}
