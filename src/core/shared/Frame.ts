import { IParams } from '../models/Frame';
import { IAllowedStyles, IStyle } from '../models/Styler';
import { MessageBus } from './MessageBus';
import { Styler } from './Styler';

export class Frame {
  protected messageBus: MessageBus;
  protected params: IParams;

  public parseUrl() {
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
    params.styles = styles;
    return params;
  }

  public applyStyles() {
    new Styler(this.getAllowedStyles()).inject(this.params.styles);
  }

  protected onInit() {
    this.params = this.parseUrl();
    this.messageBus = new MessageBus(this.params.origin);
    this.applyStyles();
  }

  protected getAllowedParams() {
    return ['locale', 'origin'];
  }

  protected getAllowedStyles() {
    const allowed: IAllowedStyles = {
      'background-color-body': { property: 'background-color', selector: 'body' },
      'color-body': { property: 'color', selector: 'body' },
      'font-size-body': { property: 'font-size', selector: 'body' },
      'line-height-body': { property: 'line-height', selector: 'body' },
      'space-inset-body': { property: 'padding', selector: 'body' },
      'space-outset-body': { property: 'margin', selector: 'body' }
    };
    return allowed;
  }
}
