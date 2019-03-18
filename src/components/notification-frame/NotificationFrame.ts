/**
 * Defines component for displaying payment status messages
 */

enum messageTypes {
  error = 'ERROR',
  sucess = 'SUCCESS',
  cancel = 'CANCEL'
}

enum elementTypes {
  element = 'element',
  content = 'content'
}

class NotificationFrame {
  private static ELEMENT_ID: string = 'st-notification-frame';
  public static ELEMENT_CLASSES = {
    error: 'notification-frame--error',
    success: 'notification-frame--success',
    cancel: 'notification-frame--cancel'
  };

  private _id: string;
  private _message: { type: messageTypes; content: string };
  private _style: object;

  set id(value: string) {
    this._id = value;
  }

  set style(value: object) {
    this._style = value;
  }

  constructor() {
    this._errorMessageListener();
  }

  public static _getElement = (elementId: string) => document.getElementById(elementId);

  /**
   * Inserts content of incoming text info into div
   * @private
   */
  private _insertContent() {
    if (NotificationFrame._getElement(NotificationFrame.ELEMENT_ID)) {
      NotificationFrame._getElement(NotificationFrame.ELEMENT_ID).textContent = this._message.content;
      NotificationFrame._getElement(NotificationFrame.ELEMENT_ID).setAttribute(
        'class',
        this._getMessageClass(this._message.type)
      );
    }
  }

  private _getMessageClass(messageType: string) {
    if (messageType === 'error') {
      return NotificationFrame.ELEMENT_CLASSES.error;
    } else if (messageType === 'success') {
      return NotificationFrame.ELEMENT_CLASSES.success;
    } else if (messageType === 'cancel') {
      return NotificationFrame.ELEMENT_CLASSES.cancel;
    }
  }

  /**
   * Listens to postMessage event, receives message from it and triggers method for inserting content into div
   * @private
   */
  private _errorMessageListener() {
    window.addEventListener(
      'message',
      ({ data }) => {
        this._message = data;
        this._insertContent();
      },
      false
    );
  }
}

export default NotificationFrame;
