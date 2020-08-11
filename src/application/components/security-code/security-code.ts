import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { SECURITY_CODE_IFRAME } from '../../core/models/constants/Selectors';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';
import '../../core/shared/override-domain/OverrideDomain';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';

(() => {
  Container.get(FrameIdentifier).setFrameName(SECURITY_CODE_IFRAME);
  Container.get(FramesHub).notifyReadyState();

  if (SecurityCode.ifFieldExists()) {
    Container.get(SecurityCode);
    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
  }
})();
