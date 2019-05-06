import DomMethods from './DomMethods';

export interface ISubStyles {
  [key: string]: string;
}

export interface IGroupedStyles {
  [key: string]: ISubStyles;
}

export interface IStyles {
  [identifier: string]: string;
}

export interface IAllowedStyles {
  [identifier: string]: {
    selector: string;
    property: string;
  };
}

/***
 * Decodes a ST Jwt passed in by a merchant
 * Does not verify it as this will be done by the server
 */
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

  public inject(styles: IStyles) {
    DomMethods.insertStyle(this._getStyleString(styles));
  }

  /**
   * Validates that the provided styles will only allow the expected values to be overridden
   */
  private _filter(styles: IStyles) {
    const filtered: IStyles = {};
    // tslint:disable-next-line:forin
    for (const style in styles) {
      if (this._allowed.hasOwnProperty(style)) {
        filtered[style] = styles[style];
      }
    }
    return filtered;
  }

  private _group(styles: IStyles) {
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

  private _getStyleString(styles: IStyles) {
    styles = this._filter(styles);
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
