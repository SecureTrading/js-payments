enum messageTypes {
  error = 'ERROR',
  info = 'INFO',
  success = 'SUCCESS',
  warning = 'WARNING'
}

/**
 * Defines component for displaying payment status messages
 */

class NotificationFrame {
  get notificationFrameElement(): HTMLElement {
    return this._notificationFrameElement;
  }

  set notificationFrameElement(value: HTMLElement) {
    this._notificationFrameElement = value;
  }

  public static ELEMENT_CLASSES = {
    error: 'notification-frame--error',
    success: 'notification-frame--success',
    warning: 'notification-frame--cancel',
    info: 'notification-frame--info'
  };
  public static _getElement = (elementId: string) => document.getElementById(elementId);

  private static ELEMENT_ID: string = 'st-notification-frame';

  private _notificationFrameElement: HTMLElement;

  /**
   * Returns proper class for every type of incoming message
   * @param messageType
   */
  public static _getMessageClass(messageType: string) {
    if (messageType === 'error') {
      return NotificationFrame.ELEMENT_CLASSES.error;
    } else if (messageType === 'success') {
      return NotificationFrame.ELEMENT_CLASSES.success;
    } else if (messageType === 'cancel' || messageType === 'warning') {
      return NotificationFrame.ELEMENT_CLASSES.warning;
    } else if (messageType === 'info') {
      return NotificationFrame.ELEMENT_CLASSES.info;
    } else {
      return '';
    }
  }

  public _message: { type: messageTypes; content: string };

  constructor() {
    this._errorMessageListener();
    this.notificationFrameElement = NotificationFrame._getElement(NotificationFrame.ELEMENT_ID);
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
      this.notificationFrameElement.setAttribute('class', NotificationFrame._getMessageClass(this._message.type));
    }
  }

  /**
   * Listens to postMessage event, receives message from it and triggers method for inserting content into div
   */
  public _errorMessageListener() {
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

export default NotificationFrame;
