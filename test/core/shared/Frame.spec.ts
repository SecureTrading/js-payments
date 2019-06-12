import each from 'jest-each';
import Frame from '../../../src/core/shared/Frame';

describe('Frame', () => {
  each([
    ['/myframe.html', {}],
    ['/myframe.html?mykey=some%20value', { styles: { mykey: 'some value' } }],
    ['/myframe.html?mykey=some%20value&locale=fr_FR', { locale: 'fr_FR', styles: { mykey: 'some value' } }],
    [
      '/myframe.html?mykey=some%20value&locale=fr_FR&origin=https%3A%2F%2Fexample.com',
      { origin: 'https://example.com', locale: 'fr_FR', styles: { mykey: 'some value' } }
    ],
    [
      '/card-number.html?background-color-input=AliceBlue&color-input-error=%23721c24&line-height-input=12px&font-size-input=12px&background-color-input-error=%23f8d7da',
      {
        styles: {
          'background-color-input': 'AliceBlue',
          'background-color-input-error': '#f8d7da',
          'color-input-error': '#721c24',
          'font-size-input': '12px',
          'line-height-input': '12px'
        }
      }
    ]
  ]).test('Frame.parseUrl', (url, expected) => {
    let frame = new Frame();
    window.history.pushState({}, 'Test Title', url);
    // @ts-ignore
    frame._getAllowedParams = jest.fn().mockReturnValueOnce(['locale', 'origin']);
    let actual = frame.parseUrl();
    expect(actual.length).toBe(expected.length);
    expect(actual).toMatchObject(expected);
  });

  describe('Frame.onInit', () => {
    it('should call parseUrl', () => {
      let frame = new Frame();
      frame.parseUrl = jest.fn().mockReturnValueOnce({ origin: 'https://example.com' });
      frame.applyStyles = jest.fn();
      // @ts-ignore
      frame.onInit();
      expect(frame.parseUrl).toHaveBeenCalledTimes(1);
      expect(frame.applyStyles).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(frame._params).toMatchObject({ origin: 'https://example.com' });
    });
  });
});
