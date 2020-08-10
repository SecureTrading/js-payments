import './card-number.scss';
import { CardNumber } from './CardNumber';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { environment } from '../../../environments/environment';
import '../../core/shared/override-domain/OverrideDomain';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { CARD_NUMBER_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(FrameIdentifier).setFrameName(CARD_NUMBER_IFRAME);
  Container.get(MessageBus);
  Container.get(FramesHub).notifyReadyState();

  if (CardNumber.ifFieldExists()) {
    Container.get(CardNumber);
    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);
  }
})();
