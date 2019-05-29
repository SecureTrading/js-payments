import '@babel/polyfill';
import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import ControlFrame from './ControlFrame';

(() => {
  return new ControlFrame();
})();
