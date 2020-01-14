import { IStyle } from '../models/Styler';
import Selectors from '../shared/Selectors';

export class Element {
  public static getComponentAddress(name: string): string {
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
    } else {
      return '';
    }
  }

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

  public create(elementName: string, styles?: IStyle, params?: object) {
    const componentAddress = Element.getComponentAddress(elementName);
    // @ts-ignore
    const componentStyles = new URLSearchParams(styles).toString();
    // @ts-ignore
    const componentParams = new URLSearchParams(params).toString();

    this._name = elementName;
    this._iframeSrc = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;
  }

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
