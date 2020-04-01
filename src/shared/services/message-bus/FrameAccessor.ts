import { Inject, Service } from 'typedi';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameCollection } from './interfaces/FrameCollection';
import { WINDOW } from '../../dependency-injection/InjectionTokens';

@Service()
export class FrameAccessor {
  constructor(private identifier: FrameIdentifier, @Inject(WINDOW) private window: Window) {}

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
