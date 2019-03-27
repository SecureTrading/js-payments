export interface SubStyles {
    [key: string]: string;
}

export interface Styles {
    [key: string]: SubStyles;
}

export interface AllowedStyles {
    [identifier: string]: Array<string>;
}

/***
 * Decodes a ST Jwt passed in by a merchant
 * Does not verify it as this will be done by the server
 */
export class Styler {
    private _allowed: AllowedStyles;

    constructor(allowed?: AllowedStyles) {
        if (allowed == undefined) {
            allowed = {input: ['font-size', 'background-color', 'color'],
                       label: ['color']
                      };
        }
        this._allowed = allowed;
    }

   /**
   * Validates that the provided styles will only allow the expected values to be overridden
   */
    private _validate(styles: Styles) {
        for (let tag in styles) {
            if (!(this._allowed.hasOwnProperty(tag))) {
                throw Error("Tag " + tag + " cannot have its style overridden");
            }
            for (let style in styles[tag]) {
                let allowedStyles = this._allowed[tag];
                if (!(allowedStyles.includes(style))) {
                    throw Error("Invalid style " + style + " defined for tag " + tag);
                }
            }
        }
    }

    public inject(styles: Styles) {
        this._validate(styles);
        let tag, elements, element: any, i;
        for (tag in styles) {
            elements = document.getElementsByTagName(tag);
            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                element.style = this._getTagStyles(styles[tag]);
            }
        }
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