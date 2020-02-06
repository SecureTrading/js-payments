import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';

(() => {
  return ExpirationDate.ifFieldExists() && new ExpirationDate();
})();
