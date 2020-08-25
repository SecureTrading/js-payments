import { IConfig } from '../../shared/model/config/IConfig';
import ST from '../../client/st/ST';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { mock, when } from 'ts-mockito';
import { of } from 'rxjs';

window.alert = jest.fn();
jest.mock('./../../application/core/shared/notification/Notification');
jest.mock('./../../application/core/shared/dom-methods/DomMethods');
jest.mock('./../../client/common-frames/CommonFrames.class');
jest.mock('./../../client/card-frames/CardFrames.class');
jest.mock('./../../application/core/integrations/visa-checkout/VisaCheckout');
jest.mock('./../../application/core/integrations/visa-checkout/VisaCheckoutMock');
jest.mock('./../../application/core/integrations/apple-pay/ApplePay');
jest.mock('./../../application/core/integrations/apple-pay/ApplePayMock');
jest.mock('./../../application/core/integrations/google-analytics/GoogleAnalytics');

// give
describe('Testing app for different requestTypes', () => {
  let resolvedData: any = '';
  // when
  const config: IConfig = {
    analytics: true,
    animatedCard: false,
    components: { defaultPaymentType: 'test', paymentTypes: ['test'], requestTypes: [], startOnLoad: true },
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1OTgzNTkwNjQsImlzcyI6ImFtMDMxMC5hdXRvYXBpIiwicGF5bG9hZCI6eyJleHBpcnlkYXRlIjoiMTAvMjIiLCJwYW4iOiI0MTExMTExMTExMTExMTExIiwic2VjdXJpdHljb2RlIjoiMTIzIiwiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJsb2NhbGUiOiJkZV9ERSIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEifX0.IUVZbBfoTTEYmlLBXNFOSlwY2eEXOmGe8HMoZnuUAG8', // Can't use property shorthand because it isn't supported by IE
    livestatus: 0,
    disableNotification: false,
    origin: 'https://someorigin.com',
    styles: {
      cardNumber: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      expirationDate: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      securityCode: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      }
    },
    submitOnError: true,
    submitOnSuccess: true,
    buttonId: 'merchant-submit-button'
  };
  const configProvider: ConfigProvider = mock<ConfigProvider>();
  when(configProvider.getConfig$()).thenReturn(of(config));
  when(configProvider.getConfig()).thenReturn(config);
  config.submitCallback = (data: any) => {
    console.error(data);
    resolvedData = data;
    return data;
  };

  let instance: any;

  // when
  const requestTypesOrderFirst = ['THREEDQUERY', 'ACCOUNTCHECK', 'AUTH', 'SUBSCRIPTION'];

  // then
  it(`should return correct list of requestTypes: ${requestTypesOrderFirst}`, () => {
    config.components.requestTypes = requestTypesOrderFirst;
    instance = ST(config);
    instance.Init = jest.fn();
    expect(resolvedData).toEqual('test');
  });

  // when
  const requestTypesOrderSecond = ['ACCOUNTCHECK', 'THREEDQUERY', 'AUTH', 'RISKDEC'];

  // then
  it(`should return correct list of requestTypes: ${requestTypesOrderSecond}`, () => {
    config.components.requestTypes = requestTypesOrderSecond;
    instance = ST(config);
    instance.Init = jest.fn();
    expect(resolvedData).toEqual('test');
  });
});
