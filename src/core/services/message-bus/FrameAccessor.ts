import { Service } from 'typedi';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameCollection } from './interfaces/FrameCollection';

@Service()
export class FrameAccessor {
  constructor(private identifier: FrameIdentifier, private window: Window = window) {
  }

  getParentFrame(): Window {
    if (this.identifier.isParentFrame()) {
      return this.window;
    }

    return this.window.parent;
  }

  getFrameCollection(): FrameCollection {
    return this.getParentFrame().frames as FrameCollection;
  }
}
