import './card-number.scss';
import { CardNumber } from './CardNumber';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { Selectors } from '../../core/shared/Selectors';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.CARD_NUMBER_IFRAME);

  if (CardNumber.ifFieldExists()) {
    Container.get(CardNumber);
    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
  }
})();
