import DomMethods from './DomMethods';

export interface SubStyles {
    [key: string]: string;
}

export interface GroupedStyles {
    [key: string]: SubStyles;
}

export interface Styles {
    [identifier: string]: string;
}

export interface AllowedStyles {
    [identifier: string]: {
        selector: string,
        property: string,
    }
}

/***
 * Decodes a ST Jwt passed in by a merchant
 * Does not verify it as this will be done by the server
 */
export class Styler {
    private _allowed: AllowedStyles;

    constructor(allowed: AllowedStyles) {
        this._allowed = allowed;
    }

   /**
   * Validates that the provided styles will only allow the expected values to be overridden
   */
    private _filter(styles: Styles) {
        let filtered: Styles = {};
        for (let style in styles) {
            if (this._allowed.hasOwnProperty(style)) {
                filtered[style] = styles[style];
            }
        }
        return filtered;
    }

    private _group(styles: Styles) {
        let grouped: GroupedStyles = {};
        let i;
        for(let style in styles) {
            let allowed = this._allowed[style];
            if (!grouped.hasOwnProperty(allowed.selector)) {
                grouped[allowed.selector] = {};
            }
            grouped[allowed.selector][allowed.property] = styles[style];
        }
        return grouped;
    }

    private _getStyleString(styles: Styles) {
        styles = this._filter(styles);
        let groupedStyles = this._group(styles);
        let tag;
        let templates = [`body { display: block; }`];
        for (tag in groupedStyles) {
            let tagStyle = this._getTagStyles(groupedStyles[tag]);
            templates.push(`${tag} { ${tagStyle} }`);
        }
        return templates.join(" ");
    }

    public inject(styles: Styles) {
        DomMethods.insertStyle(this._getStyleString(styles));
    }

    private _getTagStyles(styles: SubStyles) {
        let results = [];
        for (let style in styles) {
          results.push(`${style}: ${styles[style]};`);
        }
        const result = results.join(' ');
        return result;
    }

}