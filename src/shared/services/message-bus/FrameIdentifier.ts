import { Service } from 'typedi';
import { Selectors } from '../../../application/core/shared/Selectors';

@Service()
export class FrameIdentifier {
  private frameName: string;
  private parentFrame: boolean = false;

  getFrameName(): string {
    return this.frameName;
  }

  setFrameName(frameName: string): void {
    this.frameName = frameName;
    this.parentFrame = frameName === Selectors.MERCHANT_PARENT_FRAME;
  }

  isParentFrame(): boolean {
    return this.parentFrame;
  }

  isControlFrame(): boolean {
    return this.getFrameName() === Selectors.CONTROL_FRAME_IFRAME;
  }
}
