/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import './style.scss';
import { ST } from '../src/stjs';

(() => {
  const st = new ST(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU2MjYyOTg5LjI5MDQzMjIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoibGl2ZTIifX0.6E9JBIzCaf41_BxXi1rgyuAGn_L8l6opdGD1KAEsY1A',
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
