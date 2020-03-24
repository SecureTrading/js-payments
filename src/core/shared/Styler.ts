import { IAllowedStyles } from '../models/IAllowedStyles';
import { IGroupedStyles } from '../models/IGroupedStyles';
import { IStyle } from '../config/model/IStyle';
import { ISubStyles } from '../models/ISubStyles';
import { DomMethods } from './DomMethods';

export class Styler {
  private static _getTagStyles(styles: ISubStyles): string {
    const results = [];
    // tslint:disable-next-line:forin
    for (const style in styles) {
      results.push(`${style}: ${styles[style]};`);
    }
    return results.join(' ');
  }

  private readonly _allowed: IAllowedStyles;

  constructor(allowed: IAllowedStyles) {
    this._allowed = allowed;
  }

  public inject(styles: IStyle[]): void {
    DomMethods.insertStyle(this._getStyleString(styles));
  }

  private _filter(styles: IStyle[]): IStyle {
    const filtered: IStyle = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      if (this._allowed.hasOwnProperty(style)) {
        // @ts-ignore
        filtered[style] = styles[style];
      }
    }
    return filtered;
  }

  private _sanitize(styles: IStyle): IStyle {
    const sanitized: IStyle = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      if (/^[A-Za-z0-9 _%#]*[A-Za-z0-9][A-Za-z0-9 _%#]*$/i.test(styles[style])) {
        sanitized[style] = styles[style];
      }
    }
    return sanitized;
  }

  private _group(styles: IStyle): IGroupedStyles {
    const grouped: IGroupedStyles = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      const allowed = this._allowed[style];
      if (!grouped.hasOwnProperty(allowed.selector)) {
        grouped[allowed.selector] = {};
      }
      grouped[allowed.selector][allowed.property] = styles[style];
    }
    console.error(grouped);
    return grouped;
  }

  private _getStyleString(styles: IStyle[]): string[] {
    let groupedStyles: IGroupedStyles;
    let styled: IStyle;
    let tag: string;
    const templates: string[] = [`body { display: block; }`];
    styled = this._filter(styles);
    styled = this._sanitize(styled);
    groupedStyles = this._group(styled);
    // tslint:disable-next-line:forin
    for (tag in groupedStyles) {
      const tagStyle = Styler._getTagStyles(groupedStyles[tag]);
      templates.push(`${tag} { ${tagStyle} }`);
    }

    return templates;
  }
}
