import './notification-frame.scss';
import { NotificationFrame } from './NotificationFrame';
import { Container } from 'typedi';
import { BrowserLocalStorage } from '../../core/services/storage/BrowserLocalStorage';

(async () => {
  await Container.get(BrowserLocalStorage).ready;

  return NotificationFrame.ifFieldExists() && new NotificationFrame();
})();
