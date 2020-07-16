import { Container, Service } from 'typedi';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IParams } from '../../models/IParams';
import { MessageBus } from '../MessageBus';
import { Styler } from '../Styler';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import '../OverrideDomain';
import { frameAllowedStyles } from './frame-const';

@Service()
export class Frame {
  public params: IParams = {
    // @ts-ignore
    styles: {}
  };

  constructor(protected messageBus?: MessageBus, protected framesHub?: FramesHub) {
    this.messageBus = this.messageBus || Container.get(MessageBus);
    this.framesHub = this.framesHub || Container.get(FramesHub);
    this.framesHub.notifyReadyState();
  }

  init(): void {
    this.params.styles = this._parseUrl().styles;
    new Styler(this.getAllowedStyles()).inject(this.params.styles);
  }

  getAllowedParams(): string[] {
    return ['locale', 'origin'];
  }

  getAllowedStyles(): IAllowedStyles {
    return frameAllowedStyles;
  }

  private _parseUrl(): IParams {
    const parsedUrl = new URL(window.location.href);
    const allowedParams = this.getAllowedParams();

    parsedUrl.searchParams.forEach((value: string, param: string) => {
      if (allowedParams.includes(param)) {
        this.params[param] = value;
      } else {
        // @ts-ignore
        this.params.styles[param] = value;
      }
    });
    return this.params;
  }
}
