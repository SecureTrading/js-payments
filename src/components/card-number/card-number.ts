import './card-number.scss';
import { CardNumber } from './CardNumber';
import { Container } from 'typedi';

(() => {
  return CardNumber.ifFieldExists() && Container.get(CardNumber);
})();
