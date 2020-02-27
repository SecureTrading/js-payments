import './card-number.scss';
import { CardNumber } from './CardNumber';
import { Container } from 'typedi';
import { FramesHub } from '../../core/services/message-bus/FramesHub';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FramesHub)
    .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
    .subscribe(() => {
      return CardNumber.ifFieldExists() && Container.get(CardNumber);
    });
})();
