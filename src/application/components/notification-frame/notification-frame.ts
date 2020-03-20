import './notification-frame.scss';
import { NotificationFrame } from './NotificationFrame';
import { Container } from 'typedi';

(() => {
  return NotificationFrame.ifFieldExists() && Container.get(NotificationFrame);
})();
