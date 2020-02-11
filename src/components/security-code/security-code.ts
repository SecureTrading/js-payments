import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Container } from 'typedi';
import { BrowserLocalStorage } from '../../core/services/storage/BrowserLocalStorage';

(async () => {
  await Container.get(BrowserLocalStorage).ready;

  return SecurityCode.ifFieldExists() && new SecurityCode();
})();
