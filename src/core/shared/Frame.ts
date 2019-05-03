import { AllowedStyles, Styler, Styles } from './Styler';

interface IParams {
  [name: string]: object | string;
  styles?: Styles;
  locale?: string;
}

export default class Frame {
  protected _params: IParams;

  public onInit() {
    this._params = this.parseUrl();
    this._applyStyles();
  }

  public parseUrl() {
    const parsedUrl = new URL(window.location.href);
    const styles: Styles = {};
    const params: IParams = {};
    const allowedParams = ['locale'];
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

  protected _applyStyles() {
    new Styler(this._getAllowedStyles()).inject(this._params.styles);
  }

  protected _getAllowedStyles() {
    const allowed: AllowedStyles = {
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
