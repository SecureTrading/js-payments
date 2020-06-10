import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';
import { ConfigService } from '../../../client/config/ConfigService';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { Selectors } from '../../core/shared/Selectors';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.CONTROL_FRAME_IFRAME);
  Container.get(ConfigService).clear(false);
  Container.get(ControlFrame);
  Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
})();
