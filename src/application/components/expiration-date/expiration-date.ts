import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import { Container } from 'typedi';
import { Selectors } from '../../core/shared/Selectors';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.EXPIRATION_DATE_IFRAME);

  return ExpirationDate.ifFieldExists() && Container.get(ExpirationDate);
})();
