import { environment } from '../environments/environment';

/***
 * Defines input with iframe source
 * Can be styled by predefined JSON.
 */
export default class Element {
  private _name: string;
  private _iframeSrc: string;

  public static CARD_NUMBER_COMPONENT_NAME: string = 'cardNumber';
  public static SECURITY_CODE_COMPONENT_NAME: string = 'securityCode';
  public static EXPIRATION_DATE_COMPONENT_NAME: string = 'expirationDate';
  public static NOTIFICATION_FRAME_COMPONENT_NAME: string = 'notificationFrame';
  public static CONTROL_FRAME_COMPONENT_NAME: string = 'controlFrame';

  public static CARD_NUMBER_COMPONENT_FRAME: string = 'st-card-number-iframe';
  public static SECURITY_CODE_COMPONENT_FRAME: string = 'st-security-code-iframe';
  public static EXPIRATION_DATE_COMPONENT_FRAME: string = 'st-expiration-date-iframe';
  public static NOTIFICATION_FRAME_COMPONENT_FRAME: string = 'st-notification-frame-iframe';
  public static CONTROL_FRAME_COMPONENT_FRAME: string = 'st-control-frame-iframe';

  public static CARD_NUMBER_COMPONENT: string = `${environment.FRAME_URL}/card-number.html`;
  public static SECURITY_CODE_COMPONENT: string = `${environment.FRAME_URL}/security-code.html`;
  public static EXPIRATION_DATE_COMPONENT: string = `${environment.FRAME_URL}/expiration-date.html`;
  public static NOTIFICATION_FRAME_COMPONENT: string = `${environment.FRAME_URL}/notification-frame.html`;
  public static CONTROL_FRAME_COMPONENT: string = `${environment.FRAME_URL}/control-frame.html`;

  /***
   * Function which defines iframe src attribute
   * @param name Component name
   * @returns URL of input iframe
   */
  public static getComponentAddress(name: string) {
    if (name === Element.CARD_NUMBER_COMPONENT_NAME) {
      return Element.CARD_NUMBER_COMPONENT;
    } else if (name === Element.SECURITY_CODE_COMPONENT_NAME) {
      return Element.SECURITY_CODE_COMPONENT;
    } else if (name === Element.EXPIRATION_DATE_COMPONENT_NAME) {
      return Element.EXPIRATION_DATE_COMPONENT;
    } else if (name === Element.NOTIFICATION_FRAME_COMPONENT_NAME) {
      return Element.NOTIFICATION_FRAME_COMPONENT;
    } else if (name === Element.CONTROL_FRAME_COMPONENT_NAME) {
      return Element.CONTROL_FRAME_COMPONENT;
    }
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
   * @param params
   */
  public create(elementName: string, params?: object) {
    const componentAddress = Element.getComponentAddress(elementName);
    // @ts-ignore
    const componentParams = new URLSearchParams(params).toString(); // @TODO: add polyfill for IE

    this._name = elementName;
    this._iframeSrc = `${componentAddress}?${componentParams}`;
  }

  /***
   * Method returns 'iframed input', styled and ready to be registered in clients form
   * @param fieldId ID of field on which iframe input field will be mounted
   */
  public mount(fieldId: string) {
    const iframe = Element.createFormElement('iframe', fieldId);
    iframe.setAttribute('src', this._iframeSrc);
    iframe.setAttribute('name', fieldId);
    return iframe;
  }
}
