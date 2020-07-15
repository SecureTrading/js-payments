import { IframeFactory } from './IframeFactory';

// given
describe('IframeFactory', () => {
  let instance: IframeFactory;
  let iframe: HTMLIFrameElement;

  // when
  beforeEach(() => {
    instance = new IframeFactory();
  });

  // then
  it('should create an iframe an provide all properties set by default', () => {
    iframe = instance.create(
      'someName',
      'someId',
      { 'background-color-input': 'AliceBlue', 'color-input-error': '#721c24' },
      { locale: 'en_GB' },
      -1
    );
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe.id).toBe('someId');
    expect(iframe.className).toBe('someId');
    expect(iframe.getAttribute('name')).toBe('someId');
    expect(iframe.getAttribute('allowtransparency')).toBe('true');
    expect(iframe.getAttribute('scrolling')).toBe('no');
    expect(iframe.getAttribute('frameborder')).toBe('0');
    expect(iframe.getAttribute('tabindex')).toBe('-1');
  });
});
