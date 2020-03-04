import './notification-frame.scss';
import { NotificationFrame } from './NotificationFrame';
import { Container } from 'typedi';
import { Notification } from '../../core/shared/Notification';
import { FramesHub } from '../../core/services/message-bus/FramesHub';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FramesHub)
    .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
    .subscribe(() => {
      return NotificationFrame.ifFieldExists() && Container.get(Notification);
    });
})();
