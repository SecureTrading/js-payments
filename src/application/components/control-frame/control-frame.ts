import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';

(() => {
  return Container.get(ControlFrame);
})();
