import './style.scss';
import SecurityCode from '../../../src/core/classes/validation/SecurityCode.class';
import { inputListener } from '../../../src/core/listeners/input';

inputListener(
  'securityCode',
  'st-security-code',
  'security-code',
  'security-code'
);

const sc = new SecurityCode();
const securityCodeField = document.getElementById('security-code');

securityCodeField.addEventListener('keypress', event => {
  const { validity } = event.target;
  sc.isCharNumber(event);
  sc.isLengthCorrect(validity);
});
