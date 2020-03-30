import { Service } from 'typedi';
import { IconMap } from './IconMap';
import { IIconAttributes } from '../../models/IIconAttributes';

@Service()
export class IconFactory {
  private _attributes: IIconAttributes = {
    alt: '',
    ariaLabel: 'Credit card icon',
    class: 'st-card-icon',
    id: 'card-icon',
    src: '',
  };

  constructor(private _url: IconMap) {}

  getIcon(name: string): HTMLImageElement {
    const icon = document.createElement('img');
    Object.keys(this._attributes).map((key: string) => {
      if (this._attributes[key]) {
        icon.setAttribute(key, this._attributes[key]);
      }
    });
    icon.setAttribute('src', this._url.getUrl(name));
    icon.setAttribute('alt', this._url.getUrl(name));
    return icon;
  }
}
