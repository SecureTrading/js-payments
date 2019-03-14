import './style.scss';
import { ST } from '../src/stjs';

(() => {
  const st = new ST({}, [
    {
      name: 'VISACHECKOUT',
      livestatus: 0,
      props: {
        apikey: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
        settings: {
          locale: 'en_US',
          countryCode: 'US',
          displayName: 'Secure Trading',
          websiteUrl: 'https://www.securetrading.com/',
          customerSupportUrl: 'www....Corp.support.com',
          enableUserDataPrefill: true,
          shipping: {
            acceptedRegions: ['US', 'CA'],
            collectShipping: 'true'
          },
          payment: {
            cardBrands: ['VISA', 'MASTERCARD', 'DISCOVER', 'AMEX'],
            acceptCanadianVisaDebit: 'true',
            billingCountries: ['US', 'CA']
          },
          review: {
            message: 'Merchant defined message',
            buttonAction: 'Continue'
          },
          dataLevel: 'SUMMARY'
        },
        paymentRequest: {
          merchantRequestId: 'Merchant defined request ID',
          currencyCode: 'USD',
          subtotal: '10.00',
          shippingHandling: '2.00',
          tax: '2.00',
          discount: '1.00',
          giftWrap: '2.00',
          misc: '1.00',
          total: '16.00',
          description: 'This is some random product',
          orderId: 'Merchant defined order ID',
          promoCode: 'Merchant defined promo code',
          customData: {
            nvPair: [{ name: 'customName1', value: 'customValue1' }, { name: 'customName2', value: 'customValue2' }]
          }
        }
      },
      buttonProps: {
        size: '154',
        height: '34',
        widht: '200',
        locale: 'en_GB',
        color: 'neutral',
        acceptCanadianVisaDebit: true,
        cobrand: true
      }
    }
  ]);
})();
