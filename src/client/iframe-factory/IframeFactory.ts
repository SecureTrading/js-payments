import { Service } from 'typedi';
import { IStyle } from '../../shared/model/config/IStyle';
import { IframeFactoryAttributes } from './IframeFactoryAttributes';
import {
  ANIMATED_CARD_COMPONENT,
  CARD_NUMBER_COMPONENT,
  CONTROL_FRAME_COMPONENT,
  EXPIRATION_DATE_COMPONENT,
  SECURITY_CODE_COMPONENT
} from '../../application/core/models/constants/Selectors';

@Service()
export class IframeFactory {
  private static URLS = new Map(
    Object.entries({
      cardNumber: CARD_NUMBER_COMPONENT,
      expirationDate: EXPIRATION_DATE_COMPONENT,
      securityCode: SECURITY_CODE_COMPONENT,
      animatedCard: ANIMATED_CARD_COMPONENT,
      controlFrame: CONTROL_FRAME_COMPONENT
    })
  );

  create(name: string, id: string, styles?: IStyle, params?: {}, tabIndex?: number): HTMLIFrameElement {
    const componentParams = new URLSearchParams(params).toString();
    const componentStyles = new URLSearchParams(styles).toString();
    const componentAddress = IframeFactory.URLS.get(name);
    const iframe = document.createElement('iframe');
    const src: string = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;

    const attributes: IframeFactoryAttributes = {
      id,
      class: id,
      src,
      name: id,
      allowTransparency: true,
      scrolling: 'no',
      frameBorder: 0,
      tabIndex
    };

    // @ts-ignore
    Object.keys(attributes).forEach((value: string) => iframe.setAttribute(value, attributes[value]));
    return iframe;
  }
}
