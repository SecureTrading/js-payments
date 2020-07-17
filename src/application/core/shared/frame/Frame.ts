import { Service } from 'typedi';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IParams } from '../../models/IParams';
import { Styler } from '../Styler';
import { frameAllowedStyles } from './frame-const';

@Service()
export class Frame {
  public init(): void {
    new Styler(this._getAllowedStyles()).inject(this.parseUrl().styles);
  }

  private _getAllowedParams(): string[] {
    return ['locale', 'origin'];
  }

  public _getAllowedStyles(): IAllowedStyles {
    return frameAllowedStyles;
  }

  public parseUrl(): IParams {
    const parsedUrl = new URL(window.location.href);
    const allowedParams = this._getAllowedParams();
    const params: IParams = { styles: [] };

    parsedUrl.searchParams.forEach((value: string, param: string) => {
      if (allowedParams.includes(param)) {
        params[param] = value;
      } else {
        params.styles.push({ [param]: value });
      }
    });

    return params;
  }
}
