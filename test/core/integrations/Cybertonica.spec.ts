import { Cybertonica } from '../../../src/core/integrations/Cybertonica';
import { environment } from '../../../src/environments/environment';
import { ICybertonicaInitQuery } from '../../../src/core/models/cybertonica/CybertonicaInitQuery';
import { ICybertonicaPostQuery } from '../../../src/core/models/cybertonica/CybertonicaPostQuery';

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
      tid: undefined,
      expirydate: '11/22',
      pan: '4111111111111111',
      securitycode: '111',
    };

    // @ts-ignore
    instance._messageBus.subscribeOnParent = jest.fn((eventType, callback) => {
      if (eventType === 'CYBERTONICA') {
        callback(data);
      }
    });
    // @ts-ignore
    instance._postQuery = jest.fn().mockResolvedValueOnce(Promise.resolve());
    // @ts-ignore
    instance._setPostData = jest.fn();
    // @ts-ignore
    instance._authorizePayment = jest.fn();
    // @ts-ignore
    instance._submitEventListener();
    // @ts-ignore
    expect(instance._postQuery).toHaveBeenCalledWith(postData);
  });
});

function CybertonicaFixture() {
  const instance: Cybertonica = new Cybertonica('', '');
  instance.init();
  return { instance };
}
