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
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU4MDkzMDQ4Ljc2Nzg0MSwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMTAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0MSJ9fQ.c5rlQI7rEJc_1FPLsmxjeZc8rsglgHQG8MCrNKOiLqs';
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
