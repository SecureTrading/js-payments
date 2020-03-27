import { CardinalCommerceMock } from './CardinalCommerceMock';
import { ConfigProvider } from '../services/ConfigProvider';
import { mock, when, instance } from 'ts-mockito';

jest.mock('../../../../src/application/core/shared/Notification');

// given
describe('CardinalCommerce class', () => {
  let ccInstance: any;
  const { jwt } = CardinalCommerceMockFixture();
  let configProvider: ConfigProvider;
  configProvider = mock(ConfigProvider);
  // @ts-ignore
  when(configProvider.getConfig()).thenReturn({
    jwt: '',
    requestTypes: ['AUTH', 'THREEDQUERY']
  });

  // when
  beforeEach(() => {
    document.body.innerHTML = `<iframe id='st-control-frame-iframe'>
    </iframe><input id='JWTContainer' value="${jwt}" />`;
    ccInstance = new CardinalCommerceMock(false, jwt, 0);
  });

  // given
  describe('_performBinDetection()', () => {
    // then
    it('should not call cardinal bin process', () => {
      let { CardinalMock } = CardinalCommerceMockFixture();
      // @ts-ignore
      global.Cardinal = CardinalMock;
      expect(ccInstance._performBinDetection({ value: '411111' })).toBe(true);
      expect(CardinalMock.trigger).toHaveBeenCalledTimes(0);
    });
  });

  // given
  describe('_onCardinalLoad()', () => {
    // then
    it('should call _onCardinalSetupComplete', () => {
      ccInstance._onCardinalSetupComplete = jest.fn();
      ccInstance._onCardinalLoad();
      expect(ccInstance._onCardinalSetupComplete).toHaveBeenCalledTimes(1);
      expect(ccInstance._onCardinalSetupComplete).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_threeDSetup()', () => {
    // then
    it('should call _onCardinalLoad', () => {
      ccInstance._onCardinalLoad = jest.fn();
      ccInstance._threeDSetup();
      expect(ccInstance._onCardinalLoad).toHaveBeenCalledTimes(1);
      expect(ccInstance._onCardinalLoad).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_authenticateCard()', () => {
    // then
    it('should call _onCardinalValidated', async () => {
      ccInstance._onCardinalValidated = jest.fn();
      const mockResponse = { json: jest.fn().mockReturnValue({ data: 'somedata', jwt: 'MYJWT' }) };
      // @ts-ignore
      global.fetch = jest.fn().mockResolvedValue(mockResponse);
      await ccInstance._authenticateCard();
      expect(ccInstance._onCardinalValidated).toHaveBeenCalledTimes(1);
      expect(ccInstance._onCardinalValidated).toHaveBeenCalledWith('somedata', 'MYJWT');
    });
  });
});

function CardinalCommerceMockFixture() {
  class CardinalMock {
    static continue = jest.fn();
    static configure = jest.fn();
    static on = jest.fn();
    static setup = jest.fn();
    static trigger = jest.fn();
  }

  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU3NDIzNDgyLjk0MzE1MywicGF5bG9hZCI6eyJjdXN0b21lcnRvd24iOiJCYW5nb3IiLCJiaWxsaW5ncG9zdGNvZGUiOiJURTEyIDNTVCIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJjdXN0b21lcnByZW1pc2UiOiIxMiIsImJpbGxpbmdsYXN0bmFtZSI6Ik5hbWUiLCJsb2NhbGUiOiJlbl9HQiIsImJhc2VhbW91bnQiOiIxMDAwIiwiYmlsbGluZ2VtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImJpbGxpbmdwcmVtaXNlIjoiMTIiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImJpbGxpbmdzdHJlZXQiOiJUZXN0IHN0cmVldCIsImN1c3RvbWVyc3RyZWV0IjoiVGVzdCBzdHJlZXQiLCJjdXN0b21lcnBvc3Rjb2RlIjoiVEUxMiAzU1QiLCJjdXN0b21lcmxhc3RuYW1lIjoiTmFtZSIsImJpbGxpbmd0ZWxlcGhvbmUiOiIwMTIzNCAxMTEyMjIiLCJiaWxsaW5nZmlyc3RuYW1lIjoiVGVzdCIsImJpbGxpbmd0b3duIjoiQmFuZ29yIiwiYmlsbGluZ3RlbGVwaG9uZXR5cGUiOiJNIn19.08q3gem0kW0eODs5iGQieKbpqu7pVcvQF2xaJIgtrnc';

  return { CardinalMock, jwt };
}
