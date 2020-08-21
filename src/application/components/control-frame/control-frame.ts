import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';
import '../../core/shared/override-domain/OverrideDomain';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(FrameIdentifier).setFrameName(CONTROL_FRAME_IFRAME);
  Container.get(FramesHub).notifyReadyState();
  Container.get(ControlFrame);
  Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
})();
