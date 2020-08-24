import { Service } from 'typedi';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';

@Service()
export class FrameIdentifier {
  private frameName: string;
  private parentFrame: boolean = false;

  getFrameName(): string {
    return this.frameName;
  }

  setFrameName(frameName: string): void {
    this.frameName = frameName;
    this.parentFrame = frameName === MERCHANT_PARENT_FRAME;
  }

  isParentFrame(): boolean {
    return this.parentFrame;
  }

  isControlFrame(): boolean {
    return this.getFrameName() === CONTROL_FRAME_IFRAME;
  }
}
