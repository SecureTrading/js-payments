/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import { ST } from '../src/stjs';
import './style.scss';

/* tslint:disable:max-line-length */

(() => {
  const st = new ST(
    // Cardinal commerce dev22 Jwt:
    // 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU2MjY2ODE2LjgxMjIwODQsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoibGl2ZTIifX0.LKFdLCMO4WnaXd6nI9r5xqVWHItBQCUFa6IdlGQI8IM',
    // Cardinal commerce dev11 Jwt (fr_FR):
    // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU3NDExNDIzLjI0NTQ3LCJwYXlsb2FkIjp7ImN1c3RvbWVydG93biI6IkJhbmdvciIsImJpbGxpbmdwb3N0Y29kZSI6IlRFMTIgM1NUIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsImN1c3RvbWVycHJlbWlzZSI6IjEyIiwiYmlsbGluZ2xhc3RuYW1lIjoiTmFtZSIsImxvY2FsZSI6ImZyX0ZSIiwiYmFzZWFtb3VudCI6IjEwMDAiLCJiaWxsaW5nZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiYmlsbGluZ3ByZW1pc2UiOiIxMiIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0MSIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiYmlsbGluZ3N0cmVldCI6IlRlc3Qgc3RyZWV0IiwiY3VzdG9tZXJzdHJlZXQiOiJUZXN0IHN0cmVldCIsImN1c3RvbWVycG9zdGNvZGUiOiJURTEyIDNTVCIsImN1c3RvbWVybGFzdG5hbWUiOiJOYW1lIiwiYmlsbGluZ3RlbGVwaG9uZSI6IjAxMjM0IDExMTIyMiIsImJpbGxpbmdmaXJzdG5hbWUiOiJUZXN0IiwiYmlsbGluZ3Rvd24iOiJCYW5nb3IiLCJiaWxsaW5ndGVsZXBob25ldHlwZSI6Ik0ifX0.OQ7PaErcXj7vmR4ob_uzXv3LqoLYmD3tP6cof2FCfkQ',
    // Cardinal commerce dev11 Jwt (en_GB):
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU3NDIzNDgyLjk0MzE1MywicGF5bG9hZCI6eyJjdXN0b21lcnRvd24iOiJCYW5nb3IiLCJiaWxsaW5ncG9zdGNvZGUiOiJURTEyIDNTVCIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJjdXN0b21lcnByZW1pc2UiOiIxMiIsImJpbGxpbmdsYXN0bmFtZSI6Ik5hbWUiLCJsb2NhbGUiOiJlbl9HQiIsImJhc2VhbW91bnQiOiIxMDAwIiwiYmlsbGluZ2VtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImJpbGxpbmdwcmVtaXNlIjoiMTIiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImJpbGxpbmdzdHJlZXQiOiJUZXN0IHN0cmVldCIsImN1c3RvbWVyc3RyZWV0IjoiVGVzdCBzdHJlZXQiLCJjdXN0b21lcnBvc3Rjb2RlIjoiVEUxMiAzU1QiLCJjdXN0b21lcmxhc3RuYW1lIjoiTmFtZSIsImJpbGxpbmd0ZWxlcGhvbmUiOiIwMTIzNCAxMTEyMjIiLCJiaWxsaW5nZmlyc3RuYW1lIjoiVGVzdCIsImJpbGxpbmd0b3duIjoiQmFuZ29yIiwiYmlsbGluZ3RlbGVwaG9uZXR5cGUiOiJNIn19.08q3gem0kW0eODs5iGQieKbpqu7pVcvQF2xaJIgtrnc',
    // ApplePay/Visa checkout prod Jwt:
    // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoiMTU1NjE5MjQxMDc0OSIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6ImxpdmUyIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00ifX0.YPXFxhb72eEc5yUihniXmbyVEQfPtvULk9W36uKR2zg',
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
