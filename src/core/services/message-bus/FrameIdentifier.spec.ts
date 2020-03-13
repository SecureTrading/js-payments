import { FrameIdentifier } from './FrameIdentifier';
import { Selectors } from '../../shared/Selectors';
import { instance, mock, when } from 'ts-mockito';

describe('FrameIdentifier', () => {
  let windowMock: Window;
  let windowInstance: Window;
  let identifier: FrameIdentifier;

  beforeEach(() => {
    windowMock = mock(Window);
    windowInstance = instance(windowMock);
    identifier = new FrameIdentifier(windowInstance);
  });

  describe('getFrameName', () => {
    it('returns window name', () => {
      when(windowMock.name).thenReturn(Selectors.CONTROL_FRAME_IFRAME);
      expect(identifier.getFrameName()).toBe(Selectors.CONTROL_FRAME_IFRAME);
    });
  });

  describe('isControlFrame', () => {
    it('tells if the frame is the ControlFrame', () => {
      when(windowMock.name).thenReturn(Selectors.CONTROL_FRAME_IFRAME);
      expect(identifier.isControlFrame()).toBeTruthy();

      when(windowMock.name).thenReturn(Selectors.CARD_NUMBER_IFRAME);
      expect(identifier.isControlFrame()).toBeFalsy();
    });
  });

  describe('isParentFrame', () => {
    let parentWindowMock: Window;

    beforeEach(() => {
      parentWindowMock = mock(Window);

      when(windowMock.top).thenReturn(instance(parentWindowMock));
      when(windowMock.self).thenReturn(windowInstance as any);
    });

    it('returns true when current window is the top window', () => {
      when(windowMock.top).thenReturn(windowInstance);

      expect(identifier.isParentFrame()).toBeTruthy();
    });

    it('returns false when window name is one of the frame names', () => {
      when(windowMock.name).thenReturn(Selectors.SECURITY_CODE_IFRAME);

      expect(identifier.isParentFrame()).toBeFalsy();
    });

    it('return true when window name is empty', () => {
      when(windowMock.name).thenReturn(undefined);

      expect(identifier.isParentFrame()).toBeTruthy();
    });
  });
});
