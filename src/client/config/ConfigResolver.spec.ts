import { ConfigResolver } from './ConfigResolver';
import { IConfig } from '../../shared/model/config/IConfig';
import { ConfigSchema } from './schema/ConfigSchema';

// given
describe('ConfigResolver', () => {
  const configResolverInstance: ConfigResolver = new ConfigResolver();

  // when
  beforeEach(() => {
    ConfigSchema.validate = jest.fn().mockReturnValueOnce({ error: null });
  });

  // then
  it('should set default config when some of properties are not set ', () => {
    let { config, configResolved } = ConfigResolverFixture();
    expect(configResolverInstance.resolve(config)).toEqual(configResolved);
  });

  // then
  it('should set default config when all of the properties are not set, except of those which are obligatory', () => {
    let { minimalDefaultConfigResolve, minimalConfig } = ConfigResolverFixture();
    expect(configResolverInstance.resolve(minimalConfig)).toEqual(minimalDefaultConfigResolve);
  });

  // then
  it('should set config with given values if they are correct', () => {
    let { minimalDefaultConfigResolve } = ConfigResolverFixture();
    expect(configResolverInstance.resolve(minimalDefaultConfigResolve)).toEqual(minimalDefaultConfigResolve);
  });
});

function ConfigResolverFixture() {
  const config: IConfig = {
    analytics: true,
    animatedCard: true,
    applePay: {
      buttonStyle: 'white-outline',
      buttonText: 'donate',
      merchantId: 'merchant.net.securetrading.test',
      paymentRequest: {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: [],
        total: {
          label: 'Secure Trading Merchant',
          amount: '10.00'
        }
      },
      placement: 'st-apple-pay'
    },
    buttonId: 'merchant-submit-button',
    // @ts-ignore
    bypassCards: ['PIBA'],
    cachetoken: '',
    componentIds: {
      animatedCard: '',
      cardNumber: '',
      expirationDate: '',
      notificationFrame: '',
      securityCode: ''
    },
    components: {
      defaultPaymentType: '',
      requestTypes: [],
      paymentTypes: [],
      startOnLoad: false
    },
    cybertonicaApiKey: '',
    datacenterurl: '',
    deferInit: false,
    disableNotification: false,
    fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
    formId: 'st-form',
    init: {
      cachetoken: '',
      threedinit: ''
    },
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU4NTkxNDEzOS4wOTc5MjA3LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIn19.7mz-INqaGWutOvSO16WLuJFSCtJQkVPz_2hvQ6tbisc',
    livestatus: 0,
    origin: '',
    placeholders: {
      pan: 'Card number',
      expirydate: 'MM/YY',
      securitycode: '***'
    },
    panIcon: true,
    requestTypes: [],
    styles: {
      defaultStyles: {
        'background-color-input': 'AliceBlue'
      },
      cardNumber: {
        'font-size-input': '1.5rem',
        'line-height-input': '1.6rem'
      },
      expirationDate: {
        'font-size-input': '1.5rem',
        'line-height-input': '1.6rem'
      },
      securityCode: {
        'font-size-input': '1.5rem',
        'line-height-input': '1.6rem'
      },
      notificationFrame: {
        'color-error': '#FFF333'
      },
      controlFrame: {
        'color-error': '#3358FF'
      }
    },
    submitFields: [],
    submitOnSuccess: false,
    submitOnError: false,
    submitCallback: '',
    threedinit: '',
    translations: {
      'An error occurred': 'Wystąpił błąd'
    },
    visaCheckout: {
      buttonSettings: {
        size: '154',
        color: 'neutral'
      },
      livestatus: 0,
      merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
      paymentRequest: {
        subtotal: '20.00'
      },
      placement: 'st-visa-checkout',
      requestTypes: [],
      settings: {
        displayName: 'My Test Site'
      }
    }
  };
  const configResolved: IConfig = {
    analytics: true,
    animatedCard: true,
    applePay: {
      buttonStyle: 'white-outline',
      buttonText: 'donate',
      merchantId: 'merchant.net.securetrading.test',
      paymentRequest: {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: [],
        total: {
          label: 'Secure Trading Merchant',
          amount: '10.00'
        }
      },

      placement: 'st-apple-pay',
      requestTypes: ['AUTH']
    },
    buttonId: 'merchant-submit-button',
    // @ts-ignore
    bypassCards: ['PIBA'],
    cachetoken: '',
    cancelCallback: null,
    componentIds: {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
      expirationDate: 'st-expiration-date',
      notificationFrame: 'st-notification-frame',
      securityCode: 'st-security-code'
    },
    components: {
      defaultPaymentType: '',
      requestTypes: ['THREEDQUERY', 'AUTH'],
      paymentTypes: [''],
      startOnLoad: false
    },
    cybertonicaApiKey: '',
    datacenterurl: 'https://webservices.securetrading.net/jwt/',
    deferInit: false,
    disableNotification: false,
    errorCallback: null,
    fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
    formId: 'st-form',
    init: {
      cachetoken: '',
      threedinit: ''
    },
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU4NTkxNDEzOS4wOTc5MjA3LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIn19.7mz-INqaGWutOvSO16WLuJFSCtJQkVPz_2hvQ6tbisc',
    livestatus: 0,
    origin: 'http://localhost',
    placeholders: {
      pan: 'Card number',
      expirydate: 'MM/YY',
      securitycode: '***'
    },
    panIcon: true,
    requestTypes: ['THREEDQUERY', 'AUTH'],
    styles: {
      defaultStyles: {
        'background-color-input': 'AliceBlue'
      },
      cardNumber: {
        'font-size-input': '1.5rem',
        'line-height-input': '1.6rem'
      },
      expirationDate: {
        'font-size-input': '1.5rem',
        'line-height-input': '1.6rem'
      },
      securityCode: {
        'font-size-input': '1.5rem',
        'line-height-input': '1.6rem'
      },
      notificationFrame: {
        'color-error': '#FFF333'
      },
      controlFrame: {
        'color-error': '#3358FF'
      }
    },
    submitFields: [
      'baseamount',
      'currencyiso3a',
      'eci',
      'enrolled',
      'errorcode',
      'errordata',
      'errormessage',
      'orderreference',
      'settlestatus',
      'status',
      'transactionreference'
    ],
    submitOnCancel: false,
    submitOnSuccess: false,
    submitOnError: false,
    submitCallback: null,
    successCallback: null,
    threedinit: '',
    translations: {
      'An error occurred': 'Wystąpił błąd'
    },
    visaCheckout: {
      buttonSettings: {
        size: '154',
        color: 'neutral'
      },
      livestatus: 0,
      merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
      paymentRequest: {
        subtotal: '20.00'
      },
      placement: 'st-visa-checkout',
      requestTypes: ['AUTH'],
      settings: {
        displayName: 'My Test Site'
      }
    }
  };
  const minimalConfig: IConfig = {
    jwt: 'randomjwt'
  };
  const minimalDefaultConfigResolve: IConfig = {
    analytics: false,
    animatedCard: false,
    applePay: {},
    buttonId: '',
    // @ts-ignore
    bypassCards: [],
    cachetoken: '',
    cancelCallback: null,
    componentIds: {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
      expirationDate: 'st-expiration-date',
      notificationFrame: 'st-notification-frame',
      securityCode: 'st-security-code'
    },
    components: {
      defaultPaymentType: '',
      requestTypes: ['THREEDQUERY', 'AUTH'],
      paymentTypes: [''],
      startOnLoad: false
    },
    cybertonicaApiKey: '',
    datacenterurl: 'https://webservices.securetrading.net/jwt/',
    deferInit: false,
    disableNotification: false,
    errorCallback: null,
    fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
    formId: 'st-form',
    init: {
      cachetoken: '',
      threedinit: ''
    },
    jwt: 'randomjwt',
    livestatus: 0,
    origin: 'http://localhost',
    placeholders: {
      pan: '***** ***** ***** *****',
      expirydate: 'MM/YY',
      securitycode: '****'
    },
    panIcon: false,
    requestTypes: ['THREEDQUERY', 'AUTH'],
    styles: {},
    submitFields: [
      'baseamount',
      'currencyiso3a',
      'eci',
      'enrolled',
      'errorcode',
      'errordata',
      'errormessage',
      'orderreference',
      'settlestatus',
      'status',
      'transactionreference'
    ],
    submitOnCancel: false,
    submitOnSuccess: true,
    submitOnError: false,
    submitCallback: null,
    successCallback: null,
    threedinit: '',
    translations: {},
    visaCheckout: {}
  };
  return {
    config,
    configResolved,
    minimalConfig,
    minimalDefaultConfigResolve
  };
}
