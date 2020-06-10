import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { Selectors } from '../../core/shared/Selectors';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.SECURITY_CODE_IFRAME);

  if (SecurityCode.ifFieldExists()) {
    Container.get(SecurityCode);
    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
  }
})();
