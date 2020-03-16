import { FrameIdentifier } from './FrameIdentifier';
import { FrameAccessor } from './FrameAccessor';
import { instance, mock, when } from 'ts-mockito';

describe('FrameAccessor', () => {
  let identifierMock: FrameIdentifier;
  let windowMock: Window;
  let windowInstance: Window;
  let accessor: FrameAccessor;

  beforeEach(() => {
    identifierMock = mock(FrameIdentifier);
    windowMock = mock(Window);
    windowInstance = instance(windowMock);
    accessor = new FrameAccessor(instance(identifierMock), windowInstance);
  });

  describe('getParentFrame', () => {
    it('returns current window if the current window is the parent frame', () => {
      when(identifierMock.isParentFrame()).thenReturn(true);

      expect(accessor.getParentFrame()).toBe(windowInstance);
    });

    it('returns parent frame if the current window is not the parent frame', () => {
      const parentFrame: Window = instance(mock(Window));
      when(windowMock.parent).thenReturn(parentFrame);
      when(identifierMock.isParentFrame()).thenReturn(false);

      expect(accessor.getParentFrame()).toBe(parentFrame);
    });
  });

  describe('getFrameCollection', () => {
    it('returns all children frames from the parent frame', () => {
      const parentFrameMock: Window = mock(Window);
      const parentFrameInstance: Window = instance(parentFrameMock);
      const frames = ['a', 'b', 'c'];

      when(windowMock.parent).thenReturn(parentFrameInstance);
      when(parentFrameMock.frames).thenReturn((frames as unknown) as Window);
      when(identifierMock.isParentFrame()).thenReturn(false);

      expect(accessor.getFrameCollection()).toBe(frames);
    });
  });
});
