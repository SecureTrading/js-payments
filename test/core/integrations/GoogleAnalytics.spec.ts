import GoogleAnalytics from '../../../src/core/integrations/GoogleAnalytics';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('GoogleAnalytics', () => {
  const { instance } = googleAnalyticsFixture();

  // given
  describe('GoogleAnalytics', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._createGAScript = jest.fn().mockRejectedValueOnce(new Error('Async error'));
      // @ts-ignore
      instance._onInit();
    });

    // then
    it('should call _onInit function', () => {
      // @ts-ignore
      // expect(instance._createGAScript).toThrowError();
    });
  });

  // given
  describe('_createGAScript', () => {
    // when
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._createGAScript = jest.fn().mockResolvedValueOnce(GoogleAnalytics.TRANSLATION_SCRIPT_SUCCEEDED);
      // @ts-ignore
      instance._onInit();
    });

    // then
    it('should call _createGAScript function', () => {
      // dummy test
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

    // then
    it('should append GA script', () => {
      // @ts-ignore
      // expect(document.head).toContain(instance._gaScript);
    });
  });
});

function googleAnalyticsFixture() {
  const instance = new GoogleAnalytics();
  return { instance };
}
