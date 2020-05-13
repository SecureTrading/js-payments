import './card-number.scss';
import { CardNumber } from './CardNumber';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.CARD_NUMBER_IFRAME);

  return CardNumber.ifFieldExists() && Container.get(CardNumber);
})();
