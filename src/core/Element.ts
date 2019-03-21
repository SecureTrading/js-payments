import ST from './ST';

/***
 * Defines input with iframe source
 * Can be styled by predefined JSON.
 */
class Element {
  private _name: string;
  private _iframeSrc: string;

  /***
   * Function which defines iframe src attribute
   * @param name Component name
   * @returns URL of input iframe
   */
  public static getComponentAddress(name: string) {
    if (name === 'cardNumber') {
      return ST.cardNumberComponent;
    } else if (name === 'securityCode') {
      return ST.securityCodeComponent;
    } else if (name === 'expirationDate') {
      return ST.expirationDateComponent;
    } else if (name === 'controlFrame') {
      return ST.controlFrameComponent;
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
   */

  public create(elementName: string) {
    this._name = elementName;
    this._iframeSrc = Element.getComponentAddress(elementName);
  }

  /***
   * Method returns 'iframed input', styled and ready to be registered in clients form
   * @param fieldId ID of field on which iframe input field will be mounted
   */
  public mount(fieldId: string) {
    const iframe = Element.createFormElement('iframe', fieldId);
    iframe.setAttribute('src', this._iframeSrc);
    return iframe;
  }
}

export default Element;
