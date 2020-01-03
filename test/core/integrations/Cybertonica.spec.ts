import { Cybertonica } from '../../../src/core/integrations/Cybertonica';
import {
  ICybertonicaInitQuery,
  ICybertonicaPostQuery,
  ICybertonicaPostResponse
} from '../../../src/core/models/Cybertonica';
import { environment } from '../../../src/environments/environment';

// given
describe('Cybertonica', () => {
  // when
  CybertonicaFixture();
  // then
  it('should load Cybertonica sdk', () => {
    const scripts = Array.from(document.getElementsByTagName('script'));
    expect(scripts.some(script => script.getAttribute('src') === environment.CYBERTONICA.CYBERTONICA_LIVE_URL)).toEqual(
      true
    );
  });

  // then
  it('should set post data and authorize payment when submit event has been called', () => {
    const { instance } = CybertonicaFixture();
    const data: ICybertonicaInitQuery = {
      deferInit: false,
      cybertonicaApiKey: 'test',
      expirydate: '11/22',
      pan: '4111111111111111',
      securitycode: '111'
    };
    const postData: ICybertonicaPostQuery = {
      tid: 'test',
      expirydate: '11/22',
      pan: '4111111111111111',
      securitycode: '111',
      response: { status: 'ALLOW' }
    };

    // @ts-ignore
    instance._messageBus.subscribeOnParent = jest.fn((eventType, callback) => {
      if (eventType === 'CYBERTONICA') {
        callback(data);
      }
    });
    // @ts-ignore
    instance._postQuery = jest.fn().mockResolvedValueOnce(new Promise(resolve => resolve()));
    // @ts-ignore
    instance._setPostData = jest.fn();
    // @ts-ignore
    instance._authorizePayment = jest.fn();
    // @ts-ignore
    instance._submitEventListener();
    // @ts-ignore
    expect(instance._setPostData).toHaveBeenCalled();
    // @ts-ignore
    expect(instance._authorizePayment).toHaveBeenCalled();
  });
});

function CybertonicaFixture() {
  const instance: Cybertonica = new Cybertonica();
  return { instance };
}
