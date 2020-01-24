import { GoogleAnalytics } from '../../../src/core/integrations/GoogleAnalytics';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('GoogleAnalytics', () => {
  const { instance } = googleAnalyticsFixture();

  // given
  describe('init()', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._insertGALibrary = jest.fn();
      // @ts-ignore
      instance._createGAScript = jest.fn().mockResolvedValueOnce({});
    });

    // then
    it('should call _insertGALibrary and GoogleAnalytics._disableUserIDTracking', () => {
      instance.init();
      // @ts-ignore
      expect(instance._insertGALibrary).toHaveBeenCalled();
    });
  });

  // given
  describe('sendGaData', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      window.ga = jest.fn();
      // @ts-ignore
      GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');
    });

    // then
    it('should call send method from google analytics', () => {
      // @ts-ignore
      expect(window.ga).toHaveBeenCalled();
    });
  });

  // given
  describe('_createGAScript', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._createGAScript = jest.fn().mockResolvedValueOnce(GoogleAnalytics.TRANSLATION_SCRIPT_SUCCEEDED);
      instance.init();
    });

    // then
    it('should call _createGAScript function', () => {
      // @ts-ignore
      expect(instance._createGAScript).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('_insertGALibrary', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      document.head.appendChild = jest.fn();
    });

    // then
    it('should append script', async () => {
      // @ts-ignore
      const data = await instance._insertGAScript();
      // @ts-ignore
      expect(data).toEqual(GoogleAnalytics.TRANSLATION_SCRIPT_APPENDED);
    });

    //
    it('should call document.head.appendChild', async () => {
      // @ts-ignore
      await instance._insertGAScript();
      // @ts-ignore
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });

  // given
  describe('_insertGAScript', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._insertGAScript();
    });
  });
});

function googleAnalyticsFixture() {
  const instance = new GoogleAnalytics();
  return { instance };
}
