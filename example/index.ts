import './style.scss';

import { jwtgenerator } from '@securetrading/jwt-generator';
import { payload, secret, iss } from './json/jwtdata.json';

// @ts-ignore
window.configJWT = () => {
  return jwtgenerator(payload, secret, iss);
};
