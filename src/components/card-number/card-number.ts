import './card-number.scss';
import { CardNumber } from './CardNumber';

(() => {
  return CardNumber.ifFieldExists() && new CardNumber();
})();
