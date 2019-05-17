/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import { ST } from '../src/stjs';
import './style.scss';

/* tslint:disable:max-line-length */

(() => {
  const parsedUrl = new URL(window.location.href);

  const cardinalJwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU4MDgyNzA4Ljg3NTg5MjksInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEifX0.491D3UekSg6RayjrVXNtpGiYcwH-nUR2putKF-cy4-o';
  const applePayVisaCheckoutJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoiMTU1NjE5MjQxMDc0OSIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6ImxpdmUyIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00ifX0.YPXFxhb72eEc5yUihniXmbyVEQfPtvULk9W36uKR2zg';

  const jwt = parsedUrl.searchParams.get('jwt') || cardinalJwt;

  const st = new ST(
    jwt,
    window.location.origin,
    true,
    false,
    {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
      controlFrame: 'st-control-frame',
      expirationDate: 'st-expiration-date',
      notificationFrame: 'st-notification-frame',
      securityCode: 'st-security-code'
    },
    {
      'background-color-input': 'AliceBlue',
      'background-color-input-error': '#f8d7da',
      'color-input-error': '#721c24',
      'font-size-input': '12px',
      'line-height-input': '12px'
    },
    [
      {
        name: 'APPLEPAY',
        props: {
          buttonStyle: 'white-outline',
          buttonText: 'donate',
          merchantId: 'merchant.net.securetrading',
          paymentRequest: {
            countryCode: 'US',
            currencyCode: 'USD',
            merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
            supportedNetworks: [],
            total: { label: 'Secure Trading Merchant', amount: '10.00' }
          },
          placement: 'st-apple-pay',
          sitesecurity: 'gABC123DEFABC'
        }
      },
      {
        name: 'VISACHECKOUT',
        props: {
          buttonSettings: { size: '154', color: 'neutral' },
          livestatus: 0,
          merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
          paymentRequest: { subtotal: '20.00' },
          placement: 'st-visa-checkout',
          settings: { displayName: 'My Test Site' }
        }
      }
    ]
  );
})();
