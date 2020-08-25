import { MessageBus } from './MessageBus';
import { Container } from 'typedi';
import { instance, mock, when } from 'ts-mockito';
import { FrameIdentifier } from '../../../../shared/services/message-bus/FrameIdentifier';
import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { EMPTY, Observable, of } from 'rxjs';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';

describe('MessageBus', () => {
  let communicatorMock: InterFrameCommunicator;
  let framesHubMock: FramesHub;
  let frameIdentifierMock: FrameIdentifier;
  let frameAccessorMock: FrameAccessor;
  let messageBus: MessageBus;
  const incomingEvent$: Observable<IMessageBusEvent> = EMPTY;

  beforeEach(() => {
    communicatorMock = mock(InterFrameCommunicator);
    framesHubMock = mock(FramesHub);
    frameIdentifierMock = mock(FrameIdentifier);
    frameAccessorMock = mock(FrameAccessor);

    when(communicatorMock.incomingEvent$).thenReturn(incomingEvent$);
    when(framesHubMock.waitForFrame(CONTROL_FRAME_IFRAME)).thenReturn(of(CONTROL_FRAME_IFRAME));

    messageBus = new MessageBus(
      instance(communicatorMock),
      instance(framesHubMock),
      instance(frameIdentifierMock),
      instance(frameAccessorMock)
    );
  });

  afterEach(() => {
    Container.reset();
  });

  describe('constructor()', () => {
    beforeEach(() => {
      (window as any).stMessages = undefined;
    });

    it('should put messageBus instance in window object inside the control frame', () => {
      when(frameIdentifierMock.isControlFrame()).thenReturn(true);

      new MessageBus(
        instance(communicatorMock),
        instance(framesHubMock),
        instance(frameIdentifierMock),
        instance(frameAccessorMock)
      );

      expect((window as any).stMessages).toBe(incomingEvent$);
    });

    it('should not put messageBus instance in window object inside other frames', () => {
      when(frameIdentifierMock.isControlFrame()).thenReturn(false);

      new MessageBus(
        instance(communicatorMock),
        instance(framesHubMock),
        instance(frameIdentifierMock),
        instance(frameAccessorMock)
      );

      expect((window as any).stMessages).toBeUndefined();
    });
  });
});
