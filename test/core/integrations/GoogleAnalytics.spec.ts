import GoogleAnalytics from '../../../src/core/integrations/GoogleAnalytics';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('GoogleAnalytics', () => {
  const { instance } = googleAnalyticsFixture();

  // when
  beforeEach(() => {
    // @ts-ignore
    instance._onInit = jest.fn();
  });

  // then
  it('should call _onInit function', () => {
    // @ts-ignore
    expect(instance._onInit).toHaveBeenCalledTimes(1);
  });

  // given
  describe('_createGAScript', () => {
    // when
    beforeEach(() => {});

    // then
    it('spec name', () => {
      // dummy test
      expect(instance).toBeTruthy();
    });
  });

  // given
  describe('_insertGALibrary', () => {
    // when
    beforeEach(() => {});

    // then
    it('spec name', () => {});
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
