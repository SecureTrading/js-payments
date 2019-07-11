import MessageBus from '../../core/shared/MessageBus';
import { IAllowedStyles, IStyles, Styler } from './Styler';

interface IParams {
  [name: string]: object | string;
  styles?: IStyles;
  locale?: string;
  origin?: string;
  jwt?: string;
  gatewayUrl?: string;
  paymentTypes?: string;
  defaultPaymentType?: string;
}

export default class Frame {
  protected _messageBus: MessageBus;
  protected _params: IParams;

  public parseUrl() {
    const parsedUrl = new URL(window.location.href);
    const styles: IStyles = {};
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
    new Styler(this.getAllowedStyles()).inject(this._params.styles);
  }

  protected onInit() {
    this._params = this.parseUrl();
    this._messageBus = new MessageBus(this._params.origin);
    this.applyStyles();
  }

  protected getAllowedParams() {
    return ['locale'];
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
