import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';
import { BrowserLocalStorage } from '../../core/services/storage/BrowserLocalStorage';

(async () => {
  await Container.get(BrowserLocalStorage).ready;

  return new ControlFrame();
})();
