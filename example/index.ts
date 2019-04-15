/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import './style.scss';
import { ST } from '../src/stjs';

(() => {
  const st = new ST(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoiMTU1NTMwNDQ1MDA3MCIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6ImxpdmUyIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00ifX0._jy1vrny4WXzRyngWnVoj-jEWr1BcgVfhn6DcAA9ZCU',
    window.location.origin,
    {
      cardNumber: 'st-card-number',
      expirationDate: 'st-expiration-date',
      securityCode: 'st-security-code',
      controlFrame: 'st-control-frame'
    },
    'st-notification-frame',
    {
      'background-color-input': 'AliceBlue',
      'color-input-error': '#721c24',
      'line-height-input': '12px',
      'font-size-input': '12px',
      'background-color-input-error': '#f8d7da'
    },
    [
      {
        name: 'VISACHECKOUT',
        props: {
          apikey: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
          livestatus: 0,
          placement: 'st-visa-checkout',
          settings: { displayName: 'My Test Site' },
          paymentRequest: { subtotal: '20.00' },
          buttonSettings: { size: '154' }
        }
      }
    ]
  );
})();
