import './security-code.scss';
import SecurityCode from './SecurityCode';

(() => {
  return SecurityCode.ifFieldExists() && new SecurityCode();
})();
