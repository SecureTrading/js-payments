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
    [identifier: string]: [{
        selector: string,
        property: string,
    }]
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
            let alloweds = this._allowed[style];
            for (i = 0; i < alloweds.length; i++) {
                let allowed = alloweds[i];
                if (!grouped.hasOwnProperty(allowed.selector)) {
                    grouped[allowed.selector] = {};
                }
                grouped[allowed.selector][allowed.property] = styles[style];
            }
        }
        return grouped;
    }

    public inject(styles: Styles) {
        styles = this._filter(styles);
        let groupedStyles = this._group(styles);
        let tag;
        let template = `body { display: block; }`;
        for (tag in groupedStyles) {
            let tagStyle = this._getTagStyles(groupedStyles[tag]);
            template += `${tag} { ${tagStyle} }`;
        }
        let style = document.createElement("style");
        style.innerHTML = template;
        document.head.appendChild(style);
    }

    private _getTagStyles(styles: SubStyles) {
        let results = [];
        for (let style in styles) {
          results.push(`${style}: ${styles[style]};`);
        }
        const result = results.join(" ");
        return result;
    }

}