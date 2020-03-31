import { Inject, Service } from 'typedi';
import { WINDOW } from '../../dependency-injection/InjectionTokens';
import { Selectors } from '../../../application/core/shared/Selectors';

@Service()
export class FrameIdentifier {
  private static readonly FRAME_NAMES = [
    Selectors.CONTROL_FRAME_IFRAME,
    Selectors.NOTIFICATION_FRAME_IFRAME,
    Selectors.CARD_NUMBER_IFRAME,
    Selectors.EXPIRATION_DATE_IFRAME,
    Selectors.SECURITY_CODE_IFRAME,
    Selectors.ANIMATED_CARD_COMPONENT_IFRAME
  ];

  constructor(@Inject(WINDOW) private window: Window) {}

  getFrameName(): string {
    return this.window.name;
  }

  isParentFrame(): boolean {
    if (this.window.top === this.window.self) {
      return true;
    }

    return !FrameIdentifier.FRAME_NAMES.includes(this.window.name);
  }

  isControlFrame(): boolean {
    return this.window.name === Selectors.CONTROL_FRAME_IFRAME;
  }
}
