import { ST } from '../src/stjs';
import './style.scss';

(() => {
  const st = new ST({}, [
    {
      name: 'VISACHECKOUT',
      props: {
        apikey: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
        livestatus: 0,
        placement: 'visa-checkout-button'
      }
    },
    {
      name: 'Apple Pay',
      props: {
        merchantIdentifier: 'merchant.net.securetrading'
      }
    }
  ]);
})();
