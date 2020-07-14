import { Service } from 'typedi';
import { IStyle } from '../../../shared/model/config/IStyle';
import { Selectors } from '../../../application/core/shared/Selectors';
import { IframeFactoryAttributes } from './IframeFactoryAttributes';

@Service()
export class IframeFactory {
  private static ATTRIBUTES: IframeFactoryAttributes;
  private static SRC: string;
  private static URLS = new Map(
    Object.entries({
      cardNumber: Selectors.CARD_NUMBER_COMPONENT,
      expirationDate: Selectors.EXPIRATION_DATE_COMPONENT,
      securityCode: Selectors.SECURITY_CODE_COMPONENT,
      animatedCard: Selectors.ANIMATED_CARD_COMPONENT,
      controlFrame: Selectors.CONTROL_FRAME_COMPONENT
    })
  );

  create(name: string, id: string, styles?: IStyle, params?: {}, tabIndex?: number): HTMLIFrameElement {
    const componentParams = new URLSearchParams(params).toString();
    const componentStyles = new URLSearchParams(styles).toString();
    const componentAddress = IframeFactory.URLS.get(name);
    const iframe = document.createElement('iframe');

    IframeFactory.SRC = `${componentAddress}?${componentStyles}${componentParams ? '&' + componentParams : ''}`;

    IframeFactory.ATTRIBUTES = {
      id,
      class: id,
      src: IframeFactory.SRC,
      name: id,
      allowTransparency: true,
      scrolling: 'no',
      frameBorder: 0,
      tabIndex
    };

    Object.keys(IframeFactory.ATTRIBUTES).forEach((value: string) =>
      // @ts-ignore
      iframe.setAttribute(value, IframeFactory.ATTRIBUTES[value])
    );
    return iframe;
  }
}
