import { IStyle } from '../../../shared/model/config/IStyle';
import { Selectors } from '../../../application/core/shared/Selectors';
import { IElementAttributes } from './IElementAttributes';

export class Element {
  private readonly _attributes: IElementAttributes;
  private readonly _src: string;

  constructor(name: string, id: string, styles?: IStyle, params?: {}, tabindex?: string) {
    const urls = new Map(
      Object.entries({
        cardNumber: Selectors.CARD_NUMBER_COMPONENT,
        expirationDate: Selectors.EXPIRATION_DATE_COMPONENT,
        securityCode: Selectors.SECURITY_CODE_COMPONENT,
        animatedCard: Selectors.ANIMATED_CARD_COMPONENT,
        controlFrame: Selectors.CONTROL_FRAME_COMPONENT
      })
    );

    const componentParams = new URLSearchParams(params).toString();
    const componentStyles = new URLSearchParams(styles).toString();
    const componentAddress = urls.get(name);

    this._src = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;

    this._attributes = {
      id,
      class: id,
      src: this._src,
      name: id,
      allowtransparency: 'true',
      scrolling: 'no',
      frameborder: '0',
      tabindex
    };
  }

  public init(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    // @ts-ignore
    Object.keys(this._attributes).forEach((name: string) => iframe.setAttribute(name, this._attributes[name]));
    return iframe;
  }
}
