import { Container, Service } from 'typedi';
import { IconMap } from './IconMap';

@Service()
export class IconFactory {
  private _attributes = { alt: '', title: '', ariaLabel: '', id: 'card-icon' };
  private readonly _icon: HTMLImageElement;

  constructor(private _url: IconMap = Container.get(IconMap)) {
    this._icon = document.createElement('img');
    this._icon.setAttribute('class', 'st-card-icon');
  }

  private _setAttributes(name: string) {
    Object.keys(this._attributes).map((key: string) => {
      // @ts-ignore
      if (this._attributes[key]) {
        // @ts-ignore
        this._icon.setAttribute(key, this._attributes[key]);
      } else {
        this._icon.setAttribute(key, name);
      }
    });
  }

  getIcon(name: string): HTMLImageElement {
    this._setAttributes(name);
    this._icon.setAttribute('src', this._url.getUrl(name));
    return this._icon;
  }
}
