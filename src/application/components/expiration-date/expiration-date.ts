import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';
import '../../core/shared/override-domain/OverrideDomain';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { EXPIRATION_DATE_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(FrameIdentifier).setFrameName(EXPIRATION_DATE_IFRAME);
  Container.get(FramesHub).notifyReadyState();

  if (ExpirationDate.ifFieldExists()) {
    Container.get(ExpirationDate);
    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
  }
})();
