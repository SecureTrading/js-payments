import { IAllowedStyles } from '../models/IAllowedStyles';
import { IParams } from '../models/IParams';
import { IStyle } from '../models/IStyle';
import { MessageBus } from './MessageBus';
import { Styler } from './Styler';

export class Frame {
  protected messageBus: MessageBus;
  protected params: IParams;

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
    params.styles = styles;
    return params;
  }

  public applyStyles(): void {
    new Styler(this.getAllowedStyles()).inject(this.params.styles);
  }

  protected onInit(): void {
    this.params = this.parseUrl();
    this.messageBus = new MessageBus(this.params.origin);
    this.applyStyles();
  }

  protected getAllowedParams(): string[] {
    return ['locale', 'origin'];
  }

  protected getAllowedStyles(): IAllowedStyles {
    return {
      'background-color-body': { property: 'background-color', selector: 'body' },
      'color-body': { property: 'color', selector: 'body' },
      'font-size-body': { property: 'font-size', selector: 'body' },
      'line-height-body': { property: 'line-height', selector: 'body' },
      'space-inset-body': { property: 'padding', selector: 'body' },
      'space-outset-body': { property: 'margin', selector: 'body' }
    };
  }
}
