import { Element } from './IframeFactory';

// given
describe('Element', () => {
  // when
  let instance: Element;

  beforeEach(() => {
    instance = new Element(
      'someName',
      'someId',
      {
        'background-color-input': 'AliceBlue',
        'color-input-error': '#721c24'
      },
      { locale: 'en_GB' },
      '-1'
    );
  });

  // given
  describe('init()', () => {
    // then
    it('should create an iframe an provide all properties set in constructor and by default', () => {
      const actual = instance.init();
      // @ts-ignore
      expect(actual.tagName).toBe('IFRAME');
      expect(actual.id).toBe('someId');
      expect(actual.className).toBe('someId');
      expect(actual.getAttribute('name')).toBe('someId');
      expect(actual.getAttribute('allowtransparency')).toBe('true');
      expect(actual.getAttribute('scrolling')).toBe('no');
      expect(actual.getAttribute('frameborder')).toBe('0');
      expect(actual.getAttribute('tabindex')).toBe('-1');
    });
  });
});
