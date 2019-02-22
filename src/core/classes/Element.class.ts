import { createFormElement } from '../helpers/dom';
import { defaultIframeStyle, iframesEndpoints } from '../imports/iframe';

const { cardNumber, expirationDate, securityCode } = iframesEndpoints;

/***
 * Defines input with iframe source
 * Can be styled by predefined JSON.
 */

class Element {
  /***
   * Function which defines iframe src attribute
   * @param name Component name
   * @returns URL of input iframe
   */
  private static getComponentAdress(name: string) {
    if (name === 'cardNumber') {
      return cardNumber;
    } else if (name === 'securityCode') {
      return securityCode;
    } else if (name === 'expirationDate') {
      return expirationDate;
    }
  }

  private _name: string;
  private _iframeSrc: string;
  private _style: object;

  get style(): object {
    return this._style;
  }

  set style(value: object) {
    this._style = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get iframeSrc(): string {
    return this._iframeSrc;
  }

  set iframeSrc(value: string) {
    this._iframeSrc = value;
  }

  constructor() {
    this._name = '';
    this._style = {
      color: '#fff',
      fontFamily: 'Lato, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      fontWeight: '600',
    };
  }

  /***
   * Method for creating element in iframe
   * @param elementName Name of input which we want to create
   * @param attributes Additional attributes like styles and classes
   */

  public create(elementName: string, attributes: any) {
    this._name = elementName;
    this._style = attributes;
    this._iframeSrc = Element.getComponentAdress(elementName);
  }

  /***
   * Method returns 'iframed input', styled and ready to be registered in clients form
   * @param fieldId ID of field on which iframe input field will be mounted
   */

  public mount(fieldId: string) {
    const iframe = createFormElement('iframe', fieldId);
    Object.assign(iframe.style, defaultIframeStyle);
    iframe.setAttribute(
      'src',
      `${this._iframeSrc}?${JSON.stringify(this._style)}`
    );
    return iframe;
  }
}

export default Element;
