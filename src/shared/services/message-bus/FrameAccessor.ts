import { Inject, Service } from 'typedi';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameCollection } from './interfaces/FrameCollection';
import { WINDOW } from '../../dependency-injection/InjectionTokens';
import { Selectors } from '../../../application/core/models/constants/Selectors';
import { IControlFrameWindow } from '../../interfaces/IControlFrameWindow';

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

    return this.getFrameCollection()[Selectors.CONTROL_FRAME_IFRAME];
  }

  getFrameCollection(): FrameCollection {
    return this.getParentFrame().frames as FrameCollection;
  }
}
