import { IAllowedStyles } from '../models/IAllowedStyles';
import { IGroupedStyles } from '../models/IGroupedStyles';
import { IStyle } from '../models/IStyle';
import { ISubStyles } from '../models/ISubStyles';
import { DomMethods } from './DomMethods';

export class Styler {
  private static _getTagStyles(styles: ISubStyles) {
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

  public inject(styles: IStyle) {
    DomMethods.insertStyle(this._getStyleString(styles));
  }

  private _filter(styles: IStyle) {
    const filtered: IStyle = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      if (this._allowed.hasOwnProperty(style)) {
        filtered[style] = styles[style];
      }
    }
    return filtered;
  }

  private _sanitize(styles: IStyle) {
    const sanitized: IStyle = {};
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      // @ts-ignore
      '\'': '&#x2F;',
      '{': '&#123;',
      '}': '&#124;'
    };
    const reg = /[&<>"'{}/]/gi;
    // tslint:disable-next-line:forin
    for (const style in styles) {
      console.error(styles[style]);
      console.error(styles[style]);
      sanitized[style] = styles[style].replace(reg, match => map[match]);
    }
    console.error('Sanitized: ', sanitized);
    return sanitized;
  }

  private _group(styles: IStyle) {
    const grouped: IGroupedStyles = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      const allowed = this._allowed[style];
      if (!grouped.hasOwnProperty(allowed.selector)) {
        grouped[allowed.selector] = {};
      }
      grouped[allowed.selector][allowed.property] = styles[style];
    }
    return grouped;
  }

  private _getStyleString(styles: IStyle) {
    styles = this._filter(styles);
    styles = this._sanitize(styles);
    const groupedStyles = this._group(styles);
    let tag;
    const templates = [`body { display: block; }`];
    // tslint:disable-next-line:forin
    for (tag in groupedStyles) {
      const tagStyle = Styler._getTagStyles(groupedStyles[tag]);
      templates.push(`${tag} { ${tagStyle} }`);
    }
    return templates.join(' ');
  }
}
