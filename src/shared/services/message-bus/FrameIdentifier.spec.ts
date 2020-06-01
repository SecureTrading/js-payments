import { FrameIdentifier } from './FrameIdentifier';
import { Selectors } from '../../../application/core/shared/Selectors';

describe('FrameIdentifier', () => {
  let identifier: FrameIdentifier;

  beforeEach(() => {
    identifier = new FrameIdentifier();
  });

  describe('getFrameName', () => {
    it('returns window name', () => {
      identifier.setFrameName('foo');
      expect(identifier.getFrameName()).toBe('foo');
    });
  });

  describe('isControlFrame', () => {
    it('tells if the frame is the ControlFrame', () => {
      identifier.setFrameName(Selectors.CONTROL_FRAME_IFRAME);
      expect(identifier.isControlFrame()).toBeTruthy();

      identifier.setFrameName(Selectors.CARD_NUMBER_IFRAME);
      expect(identifier.isControlFrame()).toBeFalsy();
    });
  });

  describe('isParentFrame', () => {
    it('returns true when current frame is the parent frame', () => {
      identifier.setFrameName(Selectors.MERCHANT_PARENT_FRAME);
      expect(identifier.isParentFrame()).toBeTruthy();

      identifier.setFrameName(Selectors.CONTROL_FRAME_IFRAME);
      expect(identifier.isParentFrame()).toBeFalsy();
    });
  });
});
