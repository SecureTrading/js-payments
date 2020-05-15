import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';
import { ConfigService } from '../../../client/config/ConfigService';

(() => {
  Container.get(ConfigService).clear();

  return Container.get(ControlFrame);
})();
