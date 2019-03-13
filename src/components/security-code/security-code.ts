import './security-code.scss';
import SecurityCode from './SecurityCode';

SecurityCode.ifFieldExists() && new SecurityCode();
