import './card-number.scss';
import { CardNumber } from './CardNumber';
import { BrowserLocalStorage } from '../../core/services/storage/BrowserLocalStorage';
import { Container } from 'typedi';

(async () => {
  await Container.get(BrowserLocalStorage).ready;

  return CardNumber.ifFieldExists() && new CardNumber();
})();
