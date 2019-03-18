/**
 * Defines component for displaying payment status messages
 */

class NotificationFrame {
  private static ELEMENT_CONTENT_ID: string = 'st-notification-frame-content';

  private _id: string;
  private _messageContent: string = '';
  private _style: object;

  set id(value: string) {
    this._id = value;
  }

  set style(value: object) {
    this._style = value;
  }

  get messageContent(): string {
    return this._messageContent;
  }

  set messageContent(value: string) {
    this._messageContent = value;
  }

  constructor() {
    this._errorMessageListener();
  }

  public static _getElement = () => document.getElementById(NotificationFrame.ELEMENT_CONTENT_ID);

  /**
   * Inserts content of incoming text info into div
   * @private
   */
  private _insertContent() {
    if (NotificationFrame._getElement() && typeof this._messageContent === 'string') {
      NotificationFrame._getElement().textContent = this.messageContent;
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
        this.messageContent = data;
        this._insertContent();
      },
      false
    );
  }
}

export default NotificationFrame;
