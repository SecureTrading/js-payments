import { CardinalCommerceMock } from './CardinalCommerceMock';

// given
describe('CardinalCommerce class', () => {
  let instance: any;
  const { jwt } = CardinalCommerceMockFixture();

  // when
  beforeEach(() => {
    document.body.innerHTML = `<iframe id='st-control-frame-iframe'>
    </iframe><input id='JWTContainer' value="${jwt}" />`;
    instance = new CardinalCommerceMock(false, jwt, ['THREEDQUERY', 'AUTH'], 0);
  });

  // given
  describe('_performBinDetection()', () => {
    // then
    it('should not call cardinal bin process', () => {
      let { CardinalMock } = CardinalCommerceMockFixture();
      // @ts-ignore
      global.Cardinal = CardinalMock;
      expect(instance._performBinDetection({ value: '411111' })).toBe(true);
      expect(CardinalMock.trigger).toHaveBeenCalledTimes(0);
    });
  });

  // given
  describe('_onCardinalLoad()', () => {
    // then
    it('should call _onCardinalSetupComplete', () => {
      instance._onCardinalSetupComplete = jest.fn();
      instance._onCardinalLoad();
      expect(instance._onCardinalSetupComplete).toHaveBeenCalledTimes(1);
      expect(instance._onCardinalSetupComplete).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_threeDSetup()', () => {
    // then
    it('should call _onCardinalLoad', () => {
      instance._onCardinalLoad = jest.fn();
      instance._threeDSetup();
      expect(instance._onCardinalLoad).toHaveBeenCalledTimes(1);
      expect(instance._onCardinalLoad).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_authenticateCard()', () => {
    // then
    it('should call _onCardinalValidated', async () => {
      instance._onCardinalValidated = jest.fn();
      const mockResponse = { json: jest.fn().mockReturnValue({ data: 'somedata', jwt: 'MYJWT' }) };
      // @ts-ignore
      global.fetch = jest.fn().mockResolvedValue(mockResponse);
      await instance._authenticateCard();
      expect(instance._onCardinalValidated).toHaveBeenCalledTimes(1);
      expect(instance._onCardinalValidated).toHaveBeenCalledWith('somedata', 'MYJWT');
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
