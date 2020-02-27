import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Container } from 'typedi';
import { FramesHub } from '../../core/services/message-bus/FramesHub';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FramesHub)
    .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
    .subscribe(() => {
      return SecurityCode.ifFieldExists() && Container.get(SecurityCode);
    });
})();
