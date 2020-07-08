import { Container } from 'typedi';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IParams } from '../../models/IParams';
import { IStyle } from '../../../../shared/model/config/IStyle';
import { MessageBus } from '../MessageBus';
import { Styler } from '../Styler';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import '../OverrideDomain';
import { frameAllowedStyles } from './frame-const';

export class Frame {
  protected params: IParams;

  constructor(protected messageBus?: MessageBus, protected framesHub?: FramesHub) {
    this.messageBus = this.messageBus || Container.get(MessageBus);
    this.framesHub = this.framesHub || Container.get(FramesHub);
    this.framesHub.notifyReadyState();
  }

  public parseUrl(): IParams {
    const parsedUrl = new URL(window.location.href);
    const styles: IStyle = {};
    const params: IParams = {};
    const allowedParams = this.getAllowedParams();
    parsedUrl.searchParams.forEach((value, param) => {
      if (allowedParams.includes(param)) {
        params[param] = value;
      } else {
        styles[param] = value;
      }
    });
    // @ts-ignore
    params.styles = styles;
    return params;
  }

  protected init(config?: IConfig): void {
    this.params = this.parseUrl();
    new Styler(this.getAllowedStyles()).inject(this.params.styles);
  }

  protected getAllowedParams(): string[] {
    return ['locale', 'origin'];
  }

  protected getAllowedStyles(): IAllowedStyles {
    return frameAllowedStyles;
  }
}
