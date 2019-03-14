import './style.scss';
import { ST } from '../src/stjs';

(() => {
  const st = new ST({}, [
    {
      name: 'Apple Pay',
      props: {
        merchantIdentifier: 'merchant.net.securetrading'
      }
    }
  ]);
})();
