import { FrameIdentifier } from './FrameIdentifier';
import {
  CARD_NUMBER_IFRAME,
  CONTROL_FRAME_IFRAME,
  MERCHANT_PARENT_FRAME
} from '../../../application/core/models/constants/Selectors';

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
      identifier.setFrameName(CONTROL_FRAME_IFRAME);
      expect(identifier.isControlFrame()).toBeTruthy();

      identifier.setFrameName(CARD_NUMBER_IFRAME);
      expect(identifier.isControlFrame()).toBeFalsy();
    });
  });

  describe('isParentFrame', () => {
    it('returns true when current frame is the parent frame', () => {
      identifier.setFrameName(MERCHANT_PARENT_FRAME);
      expect(identifier.isParentFrame()).toBeTruthy();

      identifier.setFrameName(CONTROL_FRAME_IFRAME);
      expect(identifier.isParentFrame()).toBeFalsy();
    });
  });
});
