import { Styler, AllowedStyles, Styles } from "./Styler";

export default class Frame {

    constructor() {
    }

    protected onInit() {
        this._applyStyles();
    }
    
    protected _applyStyles() {
        var parsedUrl = new URL(window.location.href);
        const styles: Styles = {};
        parsedUrl.searchParams.forEach(function (value, param) {
            styles[param] = value;
        });
        new Styler(this._getAllowedStyles()).inject(styles);
    }

    protected _getAllowedStyles() {
        let allowed: AllowedStyles = { 
            "font-size-body": [{property: "font-size", selector: "body"}],
            "line-height-body": [{property: "line-height", selector: "body"}],
        }
        return allowed;
    }

}