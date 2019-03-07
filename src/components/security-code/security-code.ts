import './security-code.scss';
import SecurityCode from '../../../src/core/classes/validation/SecurityCode.class';

if (document.getElementById('st-security-code-input')) {
  new SecurityCode('st-security-code-input');
}
