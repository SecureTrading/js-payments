import MessageBus from '../../../src/core/shared/MessageBus';

// given
describe('MessageBus', () => {
  describe('constructor', () => {
    it('should set origins and event listener', () => {
      window.addEventListener = jest.fn();
      let instance = new MessageBus();
      // @ts-ignore
      expect(instance._parentOrigin).toBeUndefined();
      // @ts-ignore
      expect(instance._frameOrigin).toBe('https://localhost:8443');
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should set origins and event listener', () => {
      window.addEventListener = jest.fn();
      let instance = new MessageBus('https://example.com');
      // @ts-ignore
      expect(instance._parentOrigin).toBe('https://example.com');
      // @ts-ignore
      expect(instance._frameOrigin).toBe('https://localhost:8443');
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('publish()', () => {
    let event: any;
    let instance: MessageBus;
    let framePostMessage: Function;

    beforeEach(() => {
      event = { type: 'MYEVENT', data: 'SOME EVENT DATA' };
      instance = new MessageBus('https://example.com');
      framePostMessage = jest.fn();
      let fakeFrame = class {
        postMessage = (x: any, y: any) => {
          framePostMessage(x, y);
        };
      };
      // @ts-ignore
      window.parent.frames['myframe'] = new fakeFrame();
      window.sessionStorage.setItem(MessageBus.SUBSCRIBERS, JSON.stringify({ MYEVENT: ['myframe'] }));
    });

    it('should postMessage to parent', () => {
      window.parent.postMessage = jest.fn();
      instance.publish(event, true);
      expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
      expect(window.parent.postMessage).toHaveBeenCalledWith(event, 'https://example.com');
    });

    it('should postMessage to subscribed', () => {
      window.parent.postMessage = jest.fn();
      instance.publish(event);
      expect(framePostMessage).toHaveBeenCalledTimes(1);
      expect(framePostMessage).toHaveBeenCalledWith(event, 'https://localhost:8443');
    });
  });

  describe('publishFromParent()', () => {
    it('should postMessage to frame', () => {
      let event = { type: 'MYEVENT', data: 'SOME EVENT DATA' };
      let framePostMessage = jest.fn();
      let fakeFrame = class {
        postMessage = (x: any, y: any) => {
          framePostMessage(x, y);
        };
      };
      // @ts-ignore
      window.frames['myframe'] = new fakeFrame();
      let instance = new MessageBus();
      instance.publishFromParent(event, 'myframe');
      expect(framePostMessage).toHaveBeenCalledTimes(1);
      expect(framePostMessage).toHaveBeenCalledWith(event, 'https://localhost:8443');
    });
  });
});
