import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import { Container } from 'typedi';

(() => {
  return ExpirationDate.ifFieldExists() && Container.get(ExpirationDate);
})();
