import { AllowedStyles, Styler, Styles } from './Styler';

export default class Frame {
  public onInit() {
    this._applyStyles();
  }

  public parseUrl() {
    const parsedUrl = new URL(window.location.href);
    const styles: Styles = {};
    parsedUrl.searchParams.forEach((value, param) => {
      styles[param] = value;
    });
    return styles;
  }

  protected _applyStyles() {
    new Styler(this._getAllowedStyles()).inject(this.parseUrl());
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
