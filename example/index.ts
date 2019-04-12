/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import './style.scss';
import { ST } from '../src/stjs';

(() => {
  const st = new ST(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU1NTA2Njk1MTUwMCwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00ifX0.dN15giE2VVk9tGUtTIm_Qoremgemxm87jsxpKvNU-Y8',
    {
      cardNumber: 'st-card-number',
      expirationDate: 'st-expiration-date',
      securityCode: 'st-security-code',
      notificationFrame: 'st-notification-frame',
      controlFrame: 'st-control-frame',
      animatedCard: 'st-animated-card'
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
