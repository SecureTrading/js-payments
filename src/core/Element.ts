import Selectors from './shared/Selectors';
import { Styles } from './shared/Styler';
/***
 * Defines input with iframe source
 * Can be styled by predefined JSON.
 */
export default class Element {
  private _name: string;
  private _iframeSrc: string;

  /***
   * Function which defines iframe src attribute
   * @param name Component name
   * @returns URL of input iframe
   */
  public static getComponentAddress(name: string) {
    if (name === Selectors.CARD_NUMBER_COMPONENT_NAME) {
      return Selectors.CARD_NUMBER_COMPONENT;
    } else if (name === Selectors.SECURITY_CODE_COMPONENT_NAME) {
      return Selectors.SECURITY_CODE_COMPONENT;
    } else if (name === Selectors.EXPIRATION_DATE_COMPONENT_NAME) {
      return Selectors.EXPIRATION_DATE_COMPONENT;
    } else if (name === Selectors.NOTIFICATION_FRAME_COMPONENT_NAME) {
      return Selectors.NOTIFICATION_FRAME_COMPONENT;
    } else if (name === Selectors.CONTROL_FRAME_COMPONENT_NAME) {
      return Selectors.CONTROL_FRAME_COMPONENT;
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
   * @param styles
   * @param params
   */
  public create(elementName: string, styles?: Styles, params?: object) {
    const componentAddress = Element.getComponentAddress(elementName);
    // @ts-ignore
    const componentStyles = new URLSearchParams(styles).toString(); // @TODO: add polyfill for IE
    // @ts-ignore
    const componentParams = new URLSearchParams(params).toString(); // @TODO: add polyfill for IE

    this._name = elementName;
    this._iframeSrc = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;
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
