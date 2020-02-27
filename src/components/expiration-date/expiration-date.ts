import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import { FramesHub } from '../../core/services/message-bus/FramesHub';
import { Container } from 'typedi';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FramesHub)
    .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
    .subscribe(() => {
      return ExpirationDate.ifFieldExists() && Container.get(ExpirationDate);
    });
})();
