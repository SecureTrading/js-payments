import { IStyle } from '../../../shared/model/config/IStyle';
import { Selectors } from '../../../application/core/shared/Selectors';
import { IframeFactoryAttributes } from './IframeFactoryAttributes';
import { Service } from 'typedi';

@Service
export class IframeFactory {
  private static URLS = new Map(
    Object.entries({
      cardNumber: Selectors.CARD_NUMBER_COMPONENT,
      expirationDate: Selectors.EXPIRATION_DATE_COMPONENT,
      securityCode: Selectors.SECURITY_CODE_COMPONENT,
      animatedCard: Selectors.ANIMATED_CARD_COMPONENT,
      controlFrame: Selectors.CONTROL_FRAME_COMPONENT
    })
  );
  private static _attributes: IframeFactoryAttributes;
  private static _src: string;

  create(name: string, id: string, styles?: IStyle, params?: {}, tabIndex?: number): HTMLIFrameElement {
    const componentParams = new URLSearchParams(params).toString();
    const componentStyles = new URLSearchParams(styles).toString();
    const componentAddress = IframeFactory.URLS.get(name);
    const iframe = document.createElement('iframe');

    IframeFactory._src = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;

    IframeFactory._attributes = {
      id,
      class: id,
      src: IframeFactory._src,
      name: id,
      allowTransparency: true,
      scrolling: 'no',
      frameBorder: 0,
      tabIndex
    };
    // @ts-ignore
    Object.keys(this._attributes).forEach((value: string) => iframe.setAttribute(value, this._attributes[value]));
    return iframe;
  }
}
