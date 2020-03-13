import { MessageBus } from './MessageBus';
import { Container } from 'typedi';
import { instance, mock, when } from 'ts-mockito';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { FrameAccessor } from '../../../shared/services/message-bus/FrameAccessor';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';

describe('MessageBus', () => {
  let communicatorMock: InterFrameCommunicator;
  let framesHubMock: FramesHub;
  let frameIdentifierMock: FrameIdentifier;
  let frameAccessorMock: FrameAccessor;
  let messageBus: MessageBus;

  beforeEach(() => {
    communicatorMock = mock(InterFrameCommunicator);
    framesHubMock = mock(FramesHub);
    frameIdentifierMock = mock(FrameIdentifier);
    frameAccessorMock = mock(FrameAccessor);
    messageBus = new MessageBus(
      instance(communicatorMock),
      instance(framesHubMock),
      instance(frameIdentifierMock),
      instance(frameAccessorMock),
    );
  });

  afterEach(() => {
    Container.reset();
  });

  describe('constructor()', () => {
    beforeEach(() => {
      (window as any).messageBus = undefined;
    });

    it('should put messageBus instance in window object inside the control frame', () => {
      when(frameIdentifierMock.isControlFrame()).thenReturn(true);

      const messageBus = new MessageBus(
        instance(communicatorMock),
        instance(framesHubMock),
        instance(frameIdentifierMock),
        instance(frameAccessorMock),
      );

      expect((window as any).messageBus).toBe(messageBus);
    });

    it('should not put messageBus instance in window object inside other frames', () => {
      when(frameIdentifierMock.isControlFrame()).thenReturn(false);

      new MessageBus(
        instance(communicatorMock),
        instance(framesHubMock),
        instance(frameIdentifierMock),
        instance(frameAccessorMock),
      );

      expect((window as any).messageBus).toBeUndefined();
    });
  });
/*
    // then
    it('should set origins and event listener', () => {
      window.addEventListener = jest.fn();
      let instance = Container.get(MessageBus);
      // @ts-ignore
      expect(instance._parentOrigin).toEqual('*');
      // @ts-ignore
      expect(instance._frameOrigin).toBe('https://localhost:8443');
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      // @ts-ignore
      const call = window.addEventListener.mock.calls[0];
      expect(call[0]).toBe('message');
      expect(call[1]).toBeInstanceOf(Function);
      expect(call.length).toBe(2);
    });

    // then
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

  // given
  describe('publish()', () => {
    let event: any;
    let instance: MessageBus;
    let framePostMessage: Function;

    // when
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

    // then
    it('should postMessage to parent', () => {
      window.parent.postMessage = jest.fn();
      instance.publish(event, true);
      expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
      expect(window.parent.postMessage).toHaveBeenCalledWith(event, 'https://example.com');
    });

    // then
    it('should postMessage to subscribed', () => {
      window.parent.postMessage = jest.fn();
      instance.publish(event);
      expect(framePostMessage).toHaveBeenCalledTimes(1);
      expect(framePostMessage).toHaveBeenCalledWith(event, 'https://localhost:8443');
    });
  });

  // given
  describe('publishFromParent()', () => {
    // then
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

  // given
  describe('publishToSelf()', () => {
    let instance = new MessageBus();
    const someRandomEvent = {
      type: 'SOME_RANDOM_EVENT',
      data: {}
    };

    // when
    beforeEach(() => {
      window.postMessage = jest.fn();
      instance.publishToSelf(someRandomEvent);
    });

    // then
    it('should call window.postMessage', () => {
      expect(window.postMessage).toHaveBeenCalledTimes(1);
      expect(window.postMessage).toHaveBeenCalledWith(someRandomEvent, window.location.origin);
    });
  });

  // given
  describe('subscribeOnParent()', () => {
    // then
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

  // given
  describe('registerMessageListener()', () => {
    // then
    it('should register message listener', () => {
      let instance = new MessageBus();
      window.addEventListener = jest.fn();
      // @ts-ignore
      instance._registerMessageListener();
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.addEventListener).toHaveBeenCalledWith('message', instance._handleMessageEvent);
    });
  });

  // given
  describe('_handleMessageEvent()', () => {
    let subFunc: Function;
    let instance: MessageBus;

    // when
    beforeEach(() => {
      instance = new MessageBus('https://parent.com');
      subFunc = jest.fn();
      // @ts-ignore
      instance._subscriptions['MYEVENTTYPE'] = subFunc;
    });

    // then
    it('should call subscription on same origin', () => {
      // @ts-ignore
      instance._handleMessageEvent({
        origin: 'https://localhost:8443',
        data: { type: 'MYEVENTTYPE', data: 'EVENT DATA' }
      });
      expect(subFunc).toHaveBeenCalledTimes(1);
      expect(subFunc).toHaveBeenCalledWith('EVENT DATA');
    });

    // then
    it(`shouldn't call subscription on parent origin`, () => {
      // @ts-ignore
      instance._handleMessageEvent({
        origin: 'https://parent.com',
        data: { type: 'MYEVENTTYPE', data: 'EVENT DATA' }
      });
      expect(subFunc).toHaveBeenCalledTimes(0);
    });

    // then
    it(`shouldn't call subscription on parent origin unless public`, () => {
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

    // then
    it(`shouldn't call subscription on unknown origin even if public`, () => {
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
 */
});
