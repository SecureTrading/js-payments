import GoogleAnalytics from '../../../src/core/integrations/GoogleAnalytics';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('GoogleAnalytics', () => {
  const { instance } = googleAnalyticsFixture();
  // when
  beforeEach(() => {});

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
  describe('_insertGAScript', () => {
    // when
    beforeEach(() => {});

    // then
    it('spec name', () => {});
  });

  // given
  describe('_insertGALibrary', () => {
    // when
    beforeEach(() => {});

    // then
    it('spec name', () => {});
  });
});

function googleAnalyticsFixture() {
  const instance = new GoogleAnalytics();
  return { instance };
}
