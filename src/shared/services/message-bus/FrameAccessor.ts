import { Inject, Service } from 'typedi';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameCollection } from './interfaces/FrameCollection';
import { WINDOW } from '../../dependency-injection/InjectionTokens';
import { IControlFrameWindow } from '../../interfaces/IControlFrameWindow';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';

@Service()
export class FrameAccessor {
  constructor(private identifier: FrameIdentifier, @Inject(WINDOW) private window: Window) {}

  getParentFrame(): Window {
    if (this.identifier.isParentFrame()) {
      return this.window;
    }

    return this.window.parent;
  }

  getControlFrame(): IControlFrameWindow | undefined {
    if (this.identifier.isControlFrame()) {
      return this.window;
    }

    return this.getFrameCollection()[CONTROL_FRAME_IFRAME];
  }

  getFrameCollection(): FrameCollection {
    return this.getParentFrame().frames as FrameCollection;
  }
}
