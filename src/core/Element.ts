/***
 * Defines input with iframe source
 * Can be styled by predefined JSON.
 */

class Element {
  public static CARD_NUMBER_COMPONENT: string = '/card-number.html';
  public static SECURITY_CODE_COMPONENT: string = '/security-code.html';
  public static EXPIRATION_DATE_COMPONENT: string = '/expiration-date.html';
  public static NOTIFICATION_FRAME_COMPONENT: string = '/notification-frame.html';

  /***
   * Function which defines iframe src attribute
   * @param name Component name
   * @returns URL of input iframe
   */
  public static getComponentAddress(name: string) {
    if (name === 'cardNumber') {
      return Element.CARD_NUMBER_COMPONENT;
    } else if (name === 'securityCode') {
      return Element.SECURITY_CODE_COMPONENT;
    } else if (name === 'expirationDate') {
      return Element.EXPIRATION_DATE_COMPONENT;
    } else if (name === 'notificationFrame') {
      return Element.NOTIFICATION_FRAME_COMPONENT;
    }
  }

  private _name: string;
  private _iframeSrc: string;

  get iframeSrc(): string {
    return this._iframeSrc;
  }

  set iframeSrc(value: string) {
    this._iframeSrc = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  /**
   * Method for creating DOM elements
   * @param type Type of element which we are creating
   * @param id ID of element
   */
  private static createFormElement = (type: string, id: string) => {
    const element = document.createElement(type);
    element.setAttribute('id', id);
    element.setAttribute('class', id);
    return element;
  };

  constructor() {
    this._name = '';
  }

  /***
   * Method for creating element in iframe
   * @param elementName Name of input which we want to create
   */

  public create(elementName: string) {
    this._name = elementName;
    this.iframeSrc = Element.getComponentAddress(elementName);
  }

  /***
   * Method returns 'iframed input', styled and ready to be registered in clients form
   * @param fieldId ID of field on which iframe input field will be mounted
   */
  public mount(fieldId: string) {
    const iframe = Element.createFormElement('iframe', fieldId);
    iframe.setAttribute('src', this.iframeSrc);
    return iframe;
  }
}

export default Element;
