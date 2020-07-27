import each from 'jest-each';
import { Frame } from './Frame';

describe('Frame', () => {
  each([
    ['/myframe.html', {}],
    ['/myframe.html?mykey=some%20value', { styles: [{ mykey: 'some value' }] }],
    ['/myframe.html?mykey=some%20value&locale=fr_FR', { locale: 'fr_FR', styles: [{ mykey: 'some value' }] }],
    [
      '/myframe.html?mykey=some%20value&locale=fr_FR&origin=https%3A%2F%2Fexample.com',
      { origin: 'https://example.com', locale: 'fr_FR', styles: [{ mykey: 'some value' }] }
    ],
    [
      '/card-number.html?background-color-input=AliceBlue&color-input-error=%23721c24&line-height-input=12px&font-size-input=12px&background-color-input-error=%23f8d7da',
      {
        styles: [
          {
            'background-color-input': 'AliceBlue'
          },
          {
            'color-input-error': '#721c24'
          },
          {
            'line-height-input': '12px'
          },
          {
            'font-size-input': '12px'
          },
          {
            'background-color-input-error': '#f8d7da'
          }
        ]
      }
    ]
  ]).test('Frame.parseUrl', (url, expected) => {
    let frame = new Frame();
    window.history.pushState({}, 'Test Title', url);
    // @ts-ignore
    frame.getAllowedParams = jest.fn().mockReturnValueOnce(['locale', 'origin']);
    // @ts-ignore
    let actual = frame.parseUrl();
    expect(actual.length).toBe(expected.length);
    expect(actual).toMatchObject(expected);
  });
});
