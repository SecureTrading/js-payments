import './notification-frame.scss';
import { NotificationFrame } from './NotificationFrame';

(() => {
  return NotificationFrame.ifFieldExists() && new NotificationFrame();
})();
