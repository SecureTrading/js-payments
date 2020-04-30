import { Service } from 'typedi';
import { IIconMap } from '../../models/IIconMap';

export const mapIcon: IIconMap = {
  amex: './images/amex.png',
  astropaycard: './images/astropaycard.png',
  diners: './images/diners.png',
  discover: './images/discover.png',
  jcb: './images/jcb.png',
  maestro: './images/maestro.png',
  mastercard: './images/mastercard.png',
  piba: './images/piba.png',
  visa: './images/visa.png'
};

@Service()
export class IconMap {
  getUrl(name: string): string {
    return mapIcon[name] ? mapIcon[name] : '';
  }
}
