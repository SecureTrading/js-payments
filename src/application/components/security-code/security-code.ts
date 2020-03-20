import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Container } from 'typedi';

(() => {
  return SecurityCode.ifFieldExists() && Container.get(SecurityCode);
})();
