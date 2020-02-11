import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import { Container } from 'typedi';
import { BrowserLocalStorage } from '../../core/services/storage/BrowserLocalStorage';

(async () => {
  await Container.get(BrowserLocalStorage).ready;

  return ExpirationDate.ifFieldExists() && new ExpirationDate();
})();
