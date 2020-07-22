import { Service } from 'typedi';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IParams } from '../../models/IParams';
import { Styler } from '../Styler';
import { frameAllowedStyles } from './frame-const';

@Service()
export class Frame {
  public init(styles: IAllowedStyles): void {
    new Styler(styles).inject(this.parseUrl().styles);
  }

  public getAllowedParams(): string[] {
    return ['locale', 'origin'];
  }

  public getAllowedStyles(): IAllowedStyles {
    return frameAllowedStyles;
  }

  public parseUrl(): IParams {
    const parsedUrl = new URL(window.location.href);
    const allowedParams = this.getAllowedParams();
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
