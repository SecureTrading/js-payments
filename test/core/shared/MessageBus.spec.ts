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
      // @ts-ignore
      const call = window.addEventListener.mock.calls[0];
      expect(call[0]).toBe('message');
      expect(call[1]).toBeInstanceOf(Function);
      expect(call.length).toBe(2);
    });

    it('should set origins and event listener', () => {
      window.addEventListener = jest.fn();
      let instance = new MessageBus('https://example.com');
      // @ts-ignore
      expect(instance._parentOrigin).toBe('https://example.com');
      // @ts-ignore
      expect(instance._frameOrigin).toBe('https://localhost:8443');
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      // @ts-ignore
      const call = window.addEventListener.mock.calls[0];
      expect(call[0]).toBe('message');
      expect(call[1]).toBeInstanceOf(Function);
      expect(call.length).toBe(2);
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

  describe('subscribeOnParent()', () => {
    it('should add callback to subscriptions', () => {
      let instance = new MessageBus();
      instance.subscribeOnParent('MYEVENT', 'MYCALLBACK');
      // @ts-ignore
      expect(instance._subscriptions).toMatchObject({
        MYEVENT: 'MYCALLBACK'
      });

      instance.subscribeOnParent('MYEVENT2', 'MYCALLBACK2');
      // @ts-ignore
      expect(instance._subscriptions).toMatchObject({
        MYEVENT: 'MYCALLBACK',
        MYEVENT2: 'MYCALLBACK2'
      });

      instance.subscribeOnParent('MYEVENT2', 'OVERRIDEN');
      // @ts-ignore
      expect(instance._subscriptions).toMatchObject({
        MYEVENT: 'MYCALLBACK',
        MYEVENT2: 'OVERRIDEN'
      });
    });
  });

  describe('registerMessageListener()', () => {
    it('should register message listener', () => {
      let instance = new MessageBus();
      window.addEventListener = jest.fn();
      // @ts-ignore
      instance.registerMessageListener();
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.addEventListener).toHaveBeenCalledWith('message', instance._handleMessageEvent);
    });
  });

  describe('_handleMessageEvent()', () => {
    let subFunc: Function;
    let instance: MessageBus;
    beforeEach(() => {
      instance = new MessageBus('https://parent.com');
      subFunc = jest.fn();
      // @ts-ignore
      instance._subscriptions['MYEVENTTYPE'] = subFunc;
    });

    it('should call subscription on same origin', () => {
      // @ts-ignore
      instance._handleMessageEvent({
        origin: 'https://localhost:8443',
        data: { type: 'MYEVENTTYPE', data: 'EVENT DATA' }
      });
      expect(subFunc).toHaveBeenCalledTimes(1);
      expect(subFunc).toHaveBeenCalledWith('EVENT DATA');
    });

    it('shouldnt call subscription on parent origin', () => {
      // @ts-ignore
      instance._handleMessageEvent({
        origin: 'https://parent.com',
        data: { type: 'MYEVENTTYPE', data: 'EVENT DATA' }
      });
      expect(subFunc).toHaveBeenCalledTimes(0);
    });

    it('shouldnt call subscription on parent origin unless public', () => {
      // @ts-ignore
      MessageBus.EVENTS_PUBLIC['MYEVENTTYPE'] = 'MYEVENTTYPE';
      // @ts-ignore
      instance._handleMessageEvent({
        origin: 'https://parent.com',
        data: { type: 'MYEVENTTYPE', data: 'EVENT DATA' }
      });
      expect(subFunc).toHaveBeenCalledTimes(1);
      expect(subFunc).toHaveBeenCalledWith('EVENT DATA');
    });

    it('shouldnt call subscription on unknown origin even if public', () => {
      // @ts-ignore
      MessageBus.EVENTS_PUBLIC['MYEVENTTYPE'] = 'MYEVENTTYPE';
      // @ts-ignore
      instance._handleMessageEvent({
        origin: 'https://unknown.com',
        data: { type: 'MYEVENTTYPE', data: 'EVENT DATA' }
      });
      expect(subFunc).toHaveBeenCalledTimes(0);
    });
  });
});
