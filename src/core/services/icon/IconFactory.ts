import { Container, Service } from 'typedi';
import { IconMap } from './IconMap';
import { IIconAttributes } from '../../models/IIconAttributes';

@Service()
export class IconFactory {
  private _attributes: IIconAttributes = {
    alt: '',
    ariaLabel: '',
    class: 'st-card-icon',
    id: 'card-icon',
    src: '',
    title: ''
  };

  constructor(private _url: IconMap = Container.get(IconMap)) {
  }

  private _setAttributes(icon: HTMLImageElement, name: string): void {
    icon.setAttribute('src', this._url.getUrl(name));
    Object.keys(this._attributes).map((key: string) => {
      if (this._attributes[key]) {
        icon.setAttribute(key, this._attributes[key]);
      }
    });
  }

  private _createIcon(name: string): HTMLImageElement {
    const icon = document.createElement('img');
    this._setAttributes(icon, name);
    return icon;
  }

  getIcon(name: string): HTMLImageElement {
    return this._createIcon(name);
  }
}
