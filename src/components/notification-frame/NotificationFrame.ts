import Frame from '../../core/shared/Frame';
import Selectors from '../../core/shared/Selectors';

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

  protected _getAllowedStyles() {
    let allowed = super._getAllowedStyles();
    const notification = `#${NotificationFrame.ELEMENT_ID}`;
    const error = `.${NotificationFrame.ELEMENT_CLASSES.error}${notification}`;
    const success = `${NotificationFrame.ELEMENT_CLASSES.success}${notification}`;
    const warning = `${NotificationFrame.ELEMENT_CLASSES.warning}${notification}`;
    const info = `${NotificationFrame.ELEMENT_CLASSES.info}${notification}`;
    allowed = {
      ...allowed,
      'background-color-notification': { property: 'background-color', selector: notification },
      'background-color-notification-error': { property: 'background-color', selector: error },
      'background-color-notification-info': { property: 'background-color', selector: info },
      'background-color-notification-success': { property: 'background-color', selector: success },
      'background-color-notification-warning': { property: 'background-color', selector: warning },
      'border-color-notification': { property: 'border-color', selector: notification },
      'border-color-notification-error': { property: 'border-color', selector: error },
      'border-color-notification-info': { property: 'border-color', selector: info },
      'border-color-notification-success': { property: 'border-color', selector: success },
      'border-color-notification-warning': { property: 'border-color', selector: warning },
      'border-radius-notification': { property: 'border-radius', selector: notification },
      'border-radius-notification-error': { property: 'border-radius', selector: error },
      'border-radius-notification-info': { property: 'border-radius', selector: info },
      'border-radius-notification-success': { property: 'border-radius', selector: success },
      'border-radius-notification-warning': { property: 'border-radius', selector: warning },
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

  private static ELEMENT_ID: string = Selectors.NOTIFICATION_FRAME_ID;
  public _message: { type: messageTypes; content: string };
  private _notificationFrameElement: HTMLElement;

  constructor() {
    super();
    this.errorMessageListener();
    this.notificationFrameElement = NotificationFrame.getElement(NotificationFrame.ELEMENT_ID);
    this.onInit();
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
    const notificationElementClass = NotificationFrame._getMessageClass(this._message.type);
    if (this.notificationFrameElement && notificationElementClass) {
      this.notificationFrameElement.classList.add(notificationElementClass);
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
