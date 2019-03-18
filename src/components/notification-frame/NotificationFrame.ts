enum messageTypes {
  error = 'ERROR',
  cancel = 'CANCEL',
  sucess = 'SUCCESS'
}

/**
 * Defines component for displaying payment status messages
 */

class NotificationFrame {
  public static ELEMENT_CLASSES = {
    error: 'notification-frame--error',
    success: 'notification-frame--success',
    cancel: 'notification-frame--cancel'
  };
  public static _getElement = (elementId: string) => document.getElementById(elementId);

  private static ELEMENT_ID: string = 'st-notification-frame';

  /**
   * Returns proper class for every type of incoming message
   * @param messageType
   * @private
   */
  private static _getMessageClass(messageType: string) {
    if (messageType === 'error') {
      return NotificationFrame.ELEMENT_CLASSES.error;
    } else if (messageType === 'success') {
      return NotificationFrame.ELEMENT_CLASSES.success;
    } else if (messageType === 'cancel') {
      return NotificationFrame.ELEMENT_CLASSES.cancel;
    }
  }

  private _message: { type: messageTypes; content: string };

  constructor() {
    this._errorMessageListener();
  }

  /**
   * Inserts content of incoming text info into div
   * @private
   */
  private _insertContent() {
    if (NotificationFrame._getElement(NotificationFrame.ELEMENT_ID)) {
      NotificationFrame._getElement(NotificationFrame.ELEMENT_ID).textContent = this._message.content;
      NotificationFrame._getElement(NotificationFrame.ELEMENT_ID).setAttribute(
        'class',
        NotificationFrame._getMessageClass(this._message.type)
      );
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
