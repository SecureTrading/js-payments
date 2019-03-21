import { ST } from '../src/stjs';
import './style.scss';

(() => {
  const st = new ST(
    {},
    'example-error-container',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUyNDg4NzIwLCJwYXlsb2FkIjp7ImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsImJhc2VhbW91bnQiOiIxMDAifX0.2akG__78CFvqxjC0nUtgJ2Nm_iTeyiUDRVHtnTArITk',
    { cardNumber: 'st-card-number', expirationDate: 'st-expiration-date', securityCode: 'st-security-code' },
    'live2',
    [
      {
        name: 'VISACHECKOUT',
        props: {
          apikey: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
          livestatus: 0,
          placement: 'visa-checkout-button'
        }
      }
    ]
  );
})();
