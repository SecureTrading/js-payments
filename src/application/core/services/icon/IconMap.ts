import { Service } from 'typedi';
import { IIconMap } from '../../models/IIconMap';

export const mapIcon: IIconMap = {
  amex: './img/cards/amex.png',
  astropaycard: './img/cards/astropaycard.png',
  diners: './img/cards/diners.png',
  discover: './img/cards/discover.png',
  jcb: './img/cards/jcb.png',
  maestro: './img/cards/maestro.png',
  mastercard: './img/cards/mastercard.png',
  piba: './img/cards/piba.png',
  visa: './img/cards/visa.png'
};

@Service()
export class IconMap {
  getUrl(name: string): string {
    return mapIcon[name] ? mapIcon[name] : '';
  }
}
