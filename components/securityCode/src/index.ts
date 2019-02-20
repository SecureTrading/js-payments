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
sc.isCharNumber(document.getElementById('security-code'));
