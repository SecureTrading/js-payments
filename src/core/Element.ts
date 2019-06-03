import Selectors from './shared/Selectors';
import { IStyles } from './shared/Styler';
/***
 * Defines input with iframe source
 * Can be styled by predefined JSON.
 */
export default class Element {
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
    } else if (name === Selectors.ANIMATED_CARD_COMPONENT_NAME) {
      return Selectors.ANIMATED_CARD_COMPONENT;
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

  constructor() {
    this._name = '';
  }

  /**
   * Method for creating element in iframe
   * @param elementName Name of input which we want to create
   * @param params
   * @param styles
   */
  public create(elementName: string, styles?: IStyles, params?: object) {
    const componentAddress = Element.getComponentAddress(elementName);
    // @ts-ignore
    const componentStyles = new URLSearchParams(styles).toString(); // @TODO: add polyfill for IE
    // @ts-ignore
    const componentParams = new URLSearchParams(params).toString(); // @TODO: add polyfill for IE

    this._name = elementName;
    this._iframeSrc = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;
  }

  /**
   * Method returns 'iframed input', styled and ready to be registered in clients form
   * @param fieldId ID of field on which iframe input field will be mounted
   */
  public mount(fieldId: string, tabindex?: string) {
    const iframe = Element.createFormElement('iframe', fieldId);
    iframe.setAttribute('src', this.iframeSrc);
    iframe.setAttribute('name', fieldId);
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    if (tabindex !== undefined) {
      iframe.setAttribute('tabindex', tabindex);
    }
    return iframe;
  }
}
