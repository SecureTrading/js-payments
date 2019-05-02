/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import './style.scss';
import { ST } from '../src/stjs';

(() => {
  const st = new ST(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU1NjE0NDY4MC42NTIxOTcxLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSJ9fQ.Mg9k3sNFig32evH6xGPxgXqT8ishkc24zglDFjWz8L0',
    window.location.origin,
    false,
    {
      cardNumber: 'st-card-number',
      expirationDate: 'st-expiration-date',
      securityCode: 'st-security-code',
      notificationFrame: 'st-notification-frame',
      controlFrame: 'st-control-frame',
      animatedCard: 'st-animated-card'
    },
    {
      'background-color-input': 'AliceBlue',
      'color-input-error': '#721c24',
      'line-height-input': '12px',
      'font-size-input': '12px',
      'background-color-input-error': '#f8d7da'
    },
    [
      {
        name: 'APPLEPAY',
        props: {
          sitereference: 'test_site',
          paymentRequest: {
            total: { label: 'Secure Trading Merchant', amount: '10.00' },
            countryCode: 'US',
            currencyCode: 'USD',
            merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
            supportedNetworks: []
          },
          merchantId: 'merchant.net.securetrading',
          sitesecurity: 'gABC123DEFABC',
          placement: 'st-apple-pay',
          buttonText: 'donate',
          buttonStyle: 'white-outline'
        }
      },
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
