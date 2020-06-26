import './style.scss';

import { jwtgenerator } from '@securetrading/jwt-generator';

// @ts-ignore
window.configJWT = async (url: string) => {
  return await fetch(url)
    .then(response => response.json())
    .then(out => {
      console.error(out);
      return jwtgenerator(out.payload, out.secret, out.iss);
    });
};
